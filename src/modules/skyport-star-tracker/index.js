import {
  addStyles,
  addSubmenuItem,
  doRequest,
  getCurrentLocation,
  getSetting,
  makeElement,
  makeElementDraggable,
  onJournalEntry,
  onSettingsChange,
  onTravel,
  onTurn,
  parseNumber,
  saveSetting,
} from '@utils';
import { onSkyportRaidDialogHide, onSkyportRaidDialogShow } from '@utils/shared/skyport-raid-dialog';

import skyportRaids from '@data/skyport-raids.json';

import settings from './settings';
import styles from './styles.css';

const skyportLocation = 'cerulean_skyport';

let catches = null;
let catchesFetchedAt = 0;
let thumbnails = null;
let panel = null;
let isFetching = false;

// Whether the user has opened the tracker this session. Not persisted — the panel only ever
// opens from the menu item, but stays "wanted" across travel so it can re-show on return.
let wantsOpen = false;

/**
 * Get the active catch threshold.
 *
 * Normal mode tracks whether each mouse has been caught here at all; Crownstar mode tracks
 * 10 catches of each (a Bronze crown).
 *
 * @return {Object} The threshold.
 */
const getThreshold = () => {
  return getSetting('skyport-star-tracker.crownstar-mode', false) ? { value: 10, progressLabel: 'at Bronze' } : { value: 1, progressLabel: 'caught' };
};

/**
 * Check if the hunter is at the Cerulean Skyport.
 *
 * @return {boolean} Whether the hunter is at the Skyport.
 */
const isAtSkyport = () => {
  return skyportLocation === getCurrentLocation();
};

/**
 * Fetch the hunter's Skyport catch stats for every mouse.
 *
 * Uses the same location mouse list request as Location Catch Stats, so the counts only
 * include catches made at the Cerulean Skyport — raid catches count here, but catches made
 * back in a mouse's home location don't.
 *
 * @param {boolean} force Whether to refetch even if the cached stats are recent.
 */
const fetchCatches = async (force = false) => {
  if (isFetching || (!force && catches && Date.now() - catchesFetchedAt < 5 * 60 * 1000)) {
    return;
  }

  isFetching = true;

  try {
    const data = await doRequest('managers/ajax/mice/mouse_list.php', {
      action: 'get_environment',
      category: skyportLocation,
      user_id: user.user_id,
      display_mode: 'stats',
      view: 'ViewMouseListEnvironments',
    });

    const subgroups = data?.mouse_list_category?.subgroups || [];
    const mice = subgroups.flatMap((subgroup) => subgroup?.mice || []);

    if (mice.length) {
      catches = new Map(mice.map((mouse) => [mouse.type, parseNumber(mouse.num_catches || 0)]));
      thumbnails = new Map(mice.filter((mouse) => mouse.image).map((mouse) => [mouse.type, mouse.image]));
      catchesFetchedAt = Date.now();
    }
  } finally {
    isFetching = false;
  }
};

/**
 * Get the number of catches for a mouse.
 *
 * @param {string} type The mouse type.
 *
 * @return {number} The number of catches.
 */
const getCatches = (type) => {
  return catches?.get(type) || 0;
};

/**
 * Get a raid's mice that are still below the threshold, alphabetically.
 *
 * @param {Object} raid      The raid group.
 * @param {Object} threshold The threshold.
 *
 * @return {Array} The mice below the threshold.
 */
const getNeededMice = (raid, threshold) => {
  return raid.mice.filter((mouse) => getCatches(mouse.type) < threshold.value).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Make a row for a mouse.
 *
 * @param {Object} mouse     The mouse.
 * @param {Object} threshold The active threshold.
 *
 * @return {Element} The mouse row.
 */
const makeMouseRow = (mouse, threshold) => {
  const row = makeElement('a', 'mh-skyport-star-tracker-mouse');
  row.title = mouse.name;
  row.addEventListener('click', () => {
    if (hg?.views?.MouseView?.show) {
      hg.views.MouseView.show(mouse.type);
    }
  });

  const image = makeElement('div', 'mh-skyport-star-tracker-mouse-image');
  const thumbnail = thumbnails?.get(mouse.type);
  if (thumbnail) {
    image.style.backgroundImage = `url('${thumbnail}')`;
  }
  row.append(image);

  makeElement('div', 'mh-skyport-star-tracker-mouse-name', mouse.name, row);

  // Most mice are SPS/SRR, so only the ABC mice get a badge.
  if ('abc' === mouse.cheese) {
    const badge = makeElement('div', ['mh-skyport-star-tracker-mouse-cheese', 'mh-skyport-star-tracker-mouse-cheese-abc'], skyportRaids.cheeses?.abc?.label || 'ABC');
    badge.title = skyportRaids.cheeses?.abc?.name || 'Aurora Bocconcini';
    row.append(badge);
  }

  // In caught mode a listed mouse is simply uncaught, so a "0/1" count is just noise.
  if (threshold.value > 1) {
    makeElement('div', 'mh-skyport-star-tracker-mouse-catches', `${getCatches(mouse.type).toLocaleString()}/${threshold.value.toLocaleString()}`, row);
  }

  if (getCatches(mouse.type) >= threshold.value) {
    row.classList.add('mh-skyport-star-tracker-mouse-complete');
    makeElement('div', 'mh-skyport-star-tracker-mouse-check', '', row);
  }

  return row;
};

/**
 * Get the current raid from the Skyport quest data, if the hunter is on one.
 *
 * @return {Object|boolean} The current raid, or false.
 */
const getCurrentRaid = () => {
  const currentRaid = user?.quests?.QuestCeruleanSkyport?.current_raid;
  return currentRaid?.type ? currentRaid : false;
};

/**
 * Make a section header for a raid group.
 *
 * @param {Object} raid  The raid group.
 * @param {number} done  The number of mice at the threshold in the raid.
 * @param {number} total The total number of mice in the raid.
 *
 * @return {Element} The section header.
 */
const makeRaidHeader = (raid, done, total) => {
  const header = makeElement('a', 'mh-skyport-star-tracker-raid-header');
  if (done >= total) {
    header.classList.add('mh-skyport-star-tracker-raid-complete');
  }

  makeElement('div', 'mh-skyport-star-tracker-raid-collapse-icon', '', header);
  makeElement('div', 'mh-skyport-star-tracker-raid-title', raid.name, header);
  makeElement('div', 'mh-skyport-star-tracker-raid-progress', `${done} of ${total}`, header);

  return header;
};

/**
 * Make the full section for a raid group: collapsible header plus its mice.
 *
 * @param {Object} raid      The raid group.
 * @param {Object} threshold The active threshold.
 * @param {Set}    collapsed The set of collapsed raid ids.
 *
 * @return {Element} The raid section.
 */
const makeRaidSection = (raid, threshold, collapsed) => {
  const section = makeElement('div', 'mh-skyport-star-tracker-raid-section');
  if (collapsed.has(raid.id)) {
    section.classList.add('collapsed');
  }

  const needed = getNeededMice(raid, threshold);

  const header = makeRaidHeader(raid, raid.mice.length - needed.length, raid.mice.length);
  header.addEventListener('click', () => {
    const isCollapsed = section.classList.toggle('collapsed');

    const stored = new Set(getSetting('skyport-star-tracker.collapsed-raids', []));
    if (isCollapsed) {
      stored.add(raid.id);
    } else {
      stored.delete(raid.id);
    }

    saveSetting('skyport-star-tracker.collapsed-raids', [...stored]);
  });

  section.append(header);

  const miceWrapper = makeElement('div', 'mh-skyport-star-tracker-raid-mice');

  let rowIndex = 0;

  /**
   * Append a group of mice rows to the section.
   *
   * @param {Array} mice The mice to append.
   */
  const appendRows = (mice) => {
    mice.forEach((mouse) => {
      const row = makeMouseRow(mouse, threshold);
      if (0 === rowIndex % 2) {
        row.classList.add('odd');
      }

      rowIndex += 1;
      miceWrapper.append(row);
    });
  };

  // Needed mice alphabetically first, then completed mice alphabetically at the bottom,
  // faded with a checkmark.
  appendRows(needed);
  appendRows(raid.mice.filter((mouse) => getCatches(mouse.type) >= threshold.value).sort((a, b) => a.name.localeCompare(b.name)));

  section.append(miceWrapper);

  return section;
};

/**
 * Render the tracker contents into the panel.
 */
const render = () => {
  if (!panel) {
    return;
  }

  const threshold = getThreshold();
  const list = panel.querySelector('.mh-skyport-star-tracker-list');
  const progress = panel.querySelector('.mh-skyport-star-tracker-progress');
  if (!list || !progress) {
    return;
  }

  list.innerHTML = '';

  if (!catches) {
    progress.textContent = 'No catch data yet.';
    return;
  }

  const allMice = skyportRaids.raids.flatMap((raid) => raid.mice);
  const done = allMice.filter((mouse) => getCatches(mouse.type) >= threshold.value).length;

  progress.textContent = `${done} of ${allMice.length} ${threshold.progressLabel}`;

  const collapsed = new Set(getSetting('skyport-star-tracker.collapsed-raids', []));

  // Show the raid the hunter is currently on first.
  const currentRaid = getCurrentRaid();
  const raids = [...skyportRaids.raids].sort((a, b) => {
    return Number(currentRaid && currentRaid.type === b.id) - Number(currentRaid && currentRaid.type === a.id);
  });

  raids.forEach((raid) => {
    list.append(makeRaidSection(raid, threshold, collapsed));
  });
};

/**
 * Check if the panel is currently visible.
 *
 * @return {boolean} Whether the panel is visible.
 */
const isPanelVisible = () => {
  return Boolean(panel) && 'none' !== panel.style.display;
};

/**
 * Hide the tracker panel because the user closed it.
 */
const closePanel = () => {
  if (panel) {
    panel.style.display = 'none';
  }

  wantsOpen = false;
};

/**
 * Build the tracker panel, using the same frame styling as the Location Catch Stats modal.
 *
 * @return {Element} The panel.
 */
const buildPanel = () => {
  const outer = document.createElement('div');
  outer.id = 'mh-skyport-star-tracker';

  const wrapper = makeElement('div', 'mh-skyport-star-tracker-wrapper');

  const header = makeElement('div', 'mh-skyport-star-tracker-header');

  const title = document.createElement('h1');
  title.textContent = 'Skyport Star Tracker';
  header.append(title);

  const buttons = makeElement('div', 'mh-skyport-star-tracker-buttons');

  const closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  closeIcon.classList.add('mh-skyport-star-tracker-close');
  closeIcon.setAttribute('viewBox', '0 0 24 24');
  closeIcon.setAttribute('width', '18');
  closeIcon.setAttribute('height', '18');
  closeIcon.setAttribute('fill', 'none');
  closeIcon.setAttribute('stroke', 'currentColor');
  closeIcon.setAttribute('stroke-width', '1.5');

  const closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  closePath.setAttribute('d', 'M18 6L6 18M6 6l12 12');
  closeIcon.append(closePath);

  closeIcon.addEventListener('click', closePanel);
  buttons.append(closeIcon);

  header.append(buttons);
  wrapper.append(header);

  const body = makeElement('div', 'mh-skyport-star-tracker-body');

  makeElement('div', 'mh-skyport-star-tracker-progress', 'Loading…', body);
  makeElement('div', 'mh-skyport-star-tracker-list', '', body);

  wrapper.append(body);
  outer.append(wrapper);

  return outer;
};

/**
 * Show the tracker panel, creating it if needed.
 */
const showPanel = async () => {
  wantsOpen = true;

  if (!panel) {
    panel = buildPanel();
    document.body.append(panel);
    makeElementDraggable('#mh-skyport-star-tracker', '#mh-skyport-star-tracker .mh-skyport-star-tracker-header', 25, 25, 'skyport-star-tracker-position');
  }

  panel.style.display = 'block';

  await fetchCatches();
  render();
};

/**
 * Toggle the tracker panel.
 */
const togglePanel = () => {
  if (isPanelVisible()) {
    closePanel();
  } else {
    showPanel();
  }
};

/**
 * Add crown progress for each raid group to the raid choice ("View Raid Intel") dialog.
 */
const addRaidIntel = async () => {
  await fetchCatches();
  if (!catches) {
    return;
  }

  const threshold = getThreshold();

  const blocks = document.querySelectorAll('.ceruleanSkyportRaidChoiceDialogView__raidBlock[data-type]');
  blocks.forEach((block) => {
    const raid = skyportRaids.raids.find((r) => r.id === block.getAttribute('data-type'));
    if (!raid) {
      return;
    }

    const existing = block.querySelector('.mh-skyport-star-tracker-raid-intel');
    if (existing) {
      existing.remove();
    }

    const needed = getNeededMice(raid, threshold);
    const done = raid.mice.length - needed.length;

    const intel = makeElement('div', 'mh-skyport-star-tracker-raid-intel');
    if (!needed.length) {
      intel.classList.add('mh-skyport-star-tracker-raid-complete');
    }

    makeElement('span', '', `${done}/${raid.mice.length} ${threshold.progressLabel}`, intel);

    if (needed.length) {
      const neededNames = needed.map((mouse) => {
        return threshold.value > 1 ? `${mouse.name} (${getCatches(mouse.type).toLocaleString()}/${threshold.value.toLocaleString()})` : mouse.name;
      });

      intel.title = `Still needed:\n${neededNames.join('\n')}`;
    } else {
      intel.title = `All mice ${threshold.progressLabel}!`;
    }

    block.append(intel);
  });
};

/**
 * Update counts from a catch entry so catches show up without extra requests.
 *
 * @param {Object} model The journal entry model.
 */
const processCatchEntry = (model) => {
  if (!catches || !isAtSkyport()) {
    return;
  }

  const isCatch = [...model.classes].some((className) => className.includes('catchsuccess') || 'relicHunter_catch' === className);
  if (!isCatch || !model.mouseType) {
    return;
  }

  catches.set(model.mouseType, getCatches(model.mouseType) + 1);
  if (isPanelVisible()) {
    render();
  }
};

/**
 * Refresh the panel after a turn so the current raid ordering follows the updated quest data.
 */
const refreshAfterTurn = () => {
  if (isPanelVisible()) {
    render();
  }
};

/**
 * Show or hide the panel to match the current location.
 *
 * Traveling away hides the panel without forgetting that the user had it open, so it
 * re-shows on the next visit to the Skyport within the same session.
 */
const updateForLocation = () => {
  if (isAtSkyport()) {
    if (wantsOpen) {
      showPanel();
    }

    return;
  }

  if (panel) {
    panel.style.display = 'none';
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'skyport-star-tracker');

  addSubmenuItem({
    menu: 'mice',
    label: 'Skyport Star Tracker',
    icon: 'https://www.mousehuntgame.com/images/ui/map/star_gold_320.png',
    callback: togglePanel,
  });

  onJournalEntry(processCatchEntry, {
    id: 'skyport-star-tracker-catches',
    stage: 'interactions',
  });

  onTurn(refreshAfterTurn, 1200);

  onTravel(null, { callback: updateForLocation });

  onSkyportRaidDialogShow(addRaidIntel);

  // Starting a raid happens through the raid choice dialog, so re-render when it closes to
  // move the new current raid to the top.
  onSkyportRaidDialogHide(() => {
    if (isPanelVisible()) {
      render();
    }
  });

  onSettingsChange('skyport-star-tracker.crownstar-mode', render);
};

/**
 * Initialize the module.
 */
export default {
  id: 'skyport-star-tracker',
  name: 'Skyport Star Tracker',
  type: 'journal-progress-stats',
  default: false,
  load: init,
  settings,
};
