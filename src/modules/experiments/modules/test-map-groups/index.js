import {
  addStyles,
  addSubmenuItem,
  createPopup,
  getData,
  setGlobal,
  setMapData
} from '@utils';

import { showSortedTab } from '../../../better-maps/modules/tab-sorted';

import mouseGroups from '@data/map-groups.json';

import mapArStyles from '../../../better-maps/styles/map-ar.css';
import sortedStyles from '../../../better-maps/styles/sorted.css';
import styles from './styles.css';

// MHCT map names that don't normalize directly to a map group key.
const groupAliases = {
  digby: 'town_of_digby',
  empyrean_sky_palace: 'sky_palace',
  gilded_birthday: 'birthday_2019_gilded',
  halloween_treat: 'halloween_treat_2021',
  halloween_trick: 'halloween_trick_2021',
  lunar_new_year: 'lunar_new_year_list',
  m1000_solo_pursuit: 'm1k_solo',
  new_year_s_party: 'new_years',
  party_size_gilded_birthday: 'birthday_2021_gilded_party_size',
  rift_stalker: 'rift_stalkers',
  rift_walker: 'rift_walkers',
};

// Group keys for the difficulty-tier and kingdom-wide map families.
const genericGroups = new Set([
  'm1k_solo',
]);

// Group keys for event maps.
const eventGroups = new Set([
  'birthday_2019_gilded',
  'birthday_2021_gilded_party_size',
  'birthday_f_list',
  'halloween_treat_2021',
  'halloween_trick_2021',
  'lunar_new_year_list',
  'naughty_f_list',
  'nice_f_list',
  'new_years',
]);

/**
 * Reduce a name to its sorted words for loose comparison.
 *
 * @param {string} text The text to tokenize.
 *
 * @return {string} The sorted, filtered words.
 */
const tokenKey = (text) => {
  return text
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, ' ')
    .split(' ')
    .filter((word) => word.length > 1)
    .sort()
    .join(' ');
};

let groupNameIndex = null;

/**
 * Get the group key for a map name via the groups' names arrays.
 *
 * @param {string} name The map name.
 *
 * @return {string|boolean} The map group key, or false if there's no match.
 */
const resolveGroupKeyByNames = (name) => {
  if (! groupNameIndex) {
    groupNameIndex = new Map();
    for (const [key, group] of Object.entries(mouseGroups)) {
      for (const groupMapName of group.names || []) {
        groupNameIndex.set(tokenKey(groupMapName), key);
      }
    }
  }

  return groupNameIndex.get(tokenKey(name)) || false;
};

/**
 * Try to match a MHCT map name to a map group key.
 *
 * @param {string} name The MHCT map name.
 *
 * @return {string|boolean} The map group key, or false if there's no match.
 */
const resolveGroupKey = (name) => {
  const byNames = resolveGroupKeyByNames(name);
  if (byNames) {
    return byNames;
  }

  const normalized = name
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, '_')
    .replaceAll(/^_+|_+$/g, '');

  const candidates = [
    normalized,
    normalized.replace(/_event_map$/, ''),
    normalized.replace(/_list_map$/, ''),
    normalized.replace(/_map$/, ''),
    normalized.replace(/_scavenger_hunt$/, ''),
    normalized.replace(/_wanted_poster$/, ''),
  ];

  const direct = candidates.find((candidate) => mouseGroups[candidate]);
  if (direct) {
    return direct;
  }

  const alias = candidates.find((candidate) => groupAliases[candidate]);
  if (alias) {
    return groupAliases[alias];
  }

  if (normalized.startsWith('naughty')) {
    return 'naughty_f_list';
  }

  if (normalized.startsWith('nice')) {
    return 'nice_f_list';
  }

  return false;
};

/**
 * Get the goal type and goals supplied for a MHCT map.
 *
 * Standard maps list mouse goals, while Scavenger Hunt maps list item goals.
 *
 * @param {Object} mapEntry The map entry from the mhct-mapper data.
 *
 * @return {{type: string, goals: Array}|false} The goal data, or false when the entry is invalid.
 */
const getMapGoals = (mapEntry) => {
  if (Array.isArray(mapEntry.mice)) {
    return { type: 'mouse', goals: mapEntry.mice };
  }

  if (Array.isArray(mapEntry.items)) {
    return { type: 'item', goals: mapEntry.items };
  }

  return false;
};

/**
 * Build fake map data for a MHCT map so the sorted tab can render it.
 *
 * @param {Object}         mapEntry The map entry from the mhct-mapper data.
 * @param {string|boolean} groupKey The map group key to render with, if any.
 *
 * @return {Promise<Object>} The fake map data.
 */
const buildTestMapData = async (mapEntry, groupKey) => {
  const mapGoals = getMapGoals(mapEntry);
  if (! mapGoals) {
    return false;
  }

  const isScavengerHunt = 'item' === mapGoals.type;
  const allGoals = await getData(isScavengerHunt ? 'item-thumbnails' : 'mice');
  const goalsByType = new Map(
    (Array.isArray(allGoals) ? allGoals : []).map((goal) => [goal.type, goal])
  );

  const goals = mapGoals.goals.map((goal) => {
    const goalData = goalsByType.get(goal.type) || {};

    return {
      unique_id: goalData.id ?? goal.id,
      type: goal.type,
      name: goal.name,
      small: goalData.images?.small || goalData.images?.thumbnail || '',
      large: goalData.images?.large || '',
      thumb: goalData.thumb || '',
    };
  });

  return {
    map_id: `test-map-groups-${mapEntry.mhct_id}`,
    name: mapEntry.name,
    map_type: groupKey || `test-map-groups-${mapEntry.mhct_id}`,
    is_complete: false,
    is_scavenger_hunt: isScavengerHunt,
    can_claim_reward: false,
    environments: [],
    goals: {
      mouse: isScavengerHunt ? [] : goals,
      item: isScavengerHunt ? goals : [],
    },
    hunters: [],
  };
};

/**
 * Render the sorted tab for the selected map inside the popup.
 *
 * @param {Object} mapEntry The map entry from the mhct-mapper data.
 */
const showTestMap = async (mapEntry) => {
  const groupKey = resolveGroupKey(mapEntry.name);
  const testMapData = await buildTestMapData(mapEntry, groupKey);
  if (! testMapData) {
    return;
  }

  await setMapData(testMapData.map_id, testMapData);

  let testMapModel = {};
  try {
    testMapModel = new hg.models.TreasureMapModel(testMapData);
  } catch {
    // The model is only used for travel confirmations, so the fake data not
    // supporting it doesn't matter here.
  }

  setGlobal('mapper', {
    mapData: testMapData,
    mapModel: testMapModel,
  });

  showSortedTab();
};

/**
 * Build the option markup for a list of maps.
 *
 * @param {Array} mapList The maps to build options for.
 *
 * @return {string} The option markup.
 */
const makeOptions = (mapList) => {
  return mapList
    .map((map) => {
      const mapGoals = getMapGoals(map);
      const label = 'item' === mapGoals.type ? 'items' : 'mice';
      return `<option value="${map.mhct_id}">${map.name} (${mapGoals.goals.length} ${label})</option>`;
    })
    .join('');
};

/**
 * Open the test popup with the map dropdown.
 */
const openTestPopup = async () => {
  // Retired maps that MHCT doesn't mark with "(Old)" or "(Retired)".
  const retiredMaps = new Set([
    'Arduous Toxic Spill Map',
    'Easy Toxic Spill Map',
    'Elaborate Toxic Spill Map',
    'Floating Isles Pirate Map',
    'Hard Toxic Spill Map',
    'Medium Map Treasure Map',
    'Medium Toxic Spill Map',
  ]);

  let maps = await getData('mhct-mapper');
  if (Array.isArray(maps)) {
    // Skip retired map variants like "(Old)", "(Retired 2020)", and "(-09.2022)".
    maps = maps.filter((map) => {
      return getMapGoals(map) && ! /\((old|retired|-)/i.test(map.name) && ! retiredMaps.has(map.name);
    });
  }

  if (! Array.isArray(maps) || 0 === maps.length) {
    createPopup({
      title: 'Test Map Groups',
      content: 'Could not load the map list from api.mouse.rip.',
      className: 'mh-improved-test-map-groups-popup',
      show: true,
    });

    return;
  }

  const sortedMaps = [...maps].sort((a, b) => a.name.localeCompare(b.name));

  const buckets = {
    area: [],
    generic: [],
    event: [],
  };

  for (const map of sortedMaps) {
    const groupKey = resolveGroupKey(map.name);

    if (groupKey && eventGroups.has(groupKey)) {
      buckets.event.push(map);
    } else if (groupKey && genericGroups.has(groupKey)) {
      buckets.generic.push(map);
    } else if (groupKey) {
      buckets.area.push(map);
    } else if (/scavenger hunt/i.test(map.name)) {
      buckets.generic.push(map);
    } else {
      buckets.event.push(map);
    }
  }

  const optgroups = [
    ['Area maps', buckets.area],
    ['Generic maps', buckets.generic],
    ['Event maps', buckets.event],
  ];

  const mapOptions = optgroups
    .filter(([, bucket]) => bucket.length > 0)
    .map(([label, bucket]) => `<optgroup label="${label}">${makeOptions(bucket)}</optgroup>`)
    .join('');

  const content = `<div class="mh-improved-test-map-groups">
    <div class="mh-improved-test-map-groups-controls">
      <label>Map
        <select class="mh-improved-test-map-groups-map">
          <option value="" disabled selected>Choose a map…</option>
          ${mapOptions}
        </select>
      </label>
    </div>
    <div class="treasureMapView-blockWrapper"></div>
  </div>`;

  createPopup({
    title: 'Test Map Groups',
    content,
    className: 'mh-improved-test-map-groups-popup jsDialogFixed',
    show: true,
  });

  const mapSelect = document.querySelector('.mh-improved-test-map-groups-map');
  if (! mapSelect) {
    return;
  }

  mapSelect.addEventListener('change', () => {
    const selected = maps.find((map) => map.mhct_id === Number.parseInt(mapSelect.value, 10));
    if (selected) {
      showTestMap(selected);
    }
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles([mapArStyles, sortedStyles, styles], 'test-map-groups');

  addSubmenuItem({
    id: 'mh-improved-test-map-groups',
    menu: 'mice',
    label: 'Test Map Groups',
    icon: 'https://i.mouse.rip/icons/list.png',
    callback: openTestPopup,
  });
};

/**
 * Module definition.
 */
export default {
  id: 'debug.test-map-groups',
  name: 'Debug: Test Better Maps map groups',
  description: 'Adds a "Test Map Groups" link to the Mice menu that previews the sorted tab markup and styles for any map.',
  load: init,
};
