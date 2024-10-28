import {
  getData,
  makeElement,
  onEvent,
  onRequest,
  onTravel,
  onTurn,
  sessionGet
} from '@utils';

import { getCompletedGoals, refreshMap } from '../utils';

const transformName = (name) => {
  if (! name) {
    return '';
  }

  name = name.replaceAll('Treasure Map', '') // Remove 'Treasure Map' from name.
    .replaceAll('Rare M1000 Team Research Expedition', 'Rare M1K Team Research'); // Shorten so it fits better.

  // Move toxic spill rank to subtitle.
  let subtitle = '';
  if (name.includes('Toxic Spill')) {
    const rankMatch = name.match(/\(([^)]+)\)/);
    if (rankMatch) {
      subtitle = `(${rankMatch[1]})`;
      name = name.replace(` ${rankMatch[0]}`, '');
    }
  }

  // Add 'Wanted Poster' to subtitle.
  if (name.includes('Wanted Poster')) {
    name = name.replace('Wanted Poster', '');
    subtitle = 'Wanted Poster';
  }

  // Add a fun icon to the map if it contains a keyword.
  const prefixIcons = {
    Halloween: '🎃',
    Birthday: '🎂',
    Rainbow: '🌈'
  };

  let prefix = Object.keys(prefixIcons).find((key) => name.includes(key)) || '';
  if (prefix) {
    prefix = `${prefixIcons[prefix]} `;
  }

  return `${prefix}${subtitle ? `<span>${name}</span><span class="mh-improved-map-sidebar-subtitle">${subtitle}</span>` : name}`;
};

let doingAddMapToSidebar = false;
/**
 * Add the map to the sidebar.
 */
const addMapToSidebar = async () => {
  const sidebar = document.querySelector('.pageSidebarView .pageSidebarView-block');
  if (! sidebar) {
    return;
  }

  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;
  if (! mapId) {
    return;
  }

  if (doingAddMapToSidebar) {
    return;
  }

  mapData = sessionGet(`mh-improved-map-cache-${mapId}`);
  if (! mapData) {
    doingAddMapToSidebar = true;
    await refreshMap();
    doingAddMapToSidebar = false;
  }

  const mapSidebar = makeElement('div', 'mh-improved-map-sidebar');
  const title = makeElement('h3', ['mh-improved-map-sidebar-title', mapData?.map_class], transformName(mapData?.name));
  title.addEventListener('click', async () => {
    mapSidebar.classList.remove('loading');
    mapSidebar.classList.add('loading');

    await refreshMap();
    await addMapToSidebar();

    mapSidebar.classList.remove('loading');
  });

  mapSidebar.append(title);

  const mapGoals = getCompletedGoals(mapData);
  const goals = mapGoals.goals;

  mapSidebar.classList.add(`mh-improved-map-sidebar-${mapGoals.type}`);

  // make sure goals is iterable
  if (! goals || ! goals.length) {
    mapSidebar.remove();
    return;
  }

  const goalsEl = makeElement('div', 'mh-improved-map-sidebar-goals');

  for (const goal of goals) {
    const goalEl = makeElement('div', 'mh-improved-map-sidebar-goal');

    const goalImage = makeElement('div', 'mh-improved-map-sidebar-goal-image');

    const thumbnail = mapData.is_scavenger_hunt ? itemThumbs.find((thumb) => thumb.type === goal.type) : miceThumbs.find((thumb) => thumb.type === goal.type);

    goalImage.style.backgroundImage = thumbnail ? `url(${thumbnail.thumb})` : `url(${goal.large})`;
    goalEl.append(goalImage);

    makeElement('div', 'mh-improved-map-sidebar-goal-name', goal.name, goalEl);

    const environments = goal?.environment_ids || [];
    if (environments.includes(user?.environment_id)) {
      goalEl.classList.add('mh-improved-map-sidebar-goal-active');
    }

    // todo: add in 'mh-improved-map-sidebar-goal-has-hunter' class and set the background image to the hunter's avatar
    // if the goal has an environment_id that matches a hunter's environment_id.
    // todo: also needs to be able to handle multiple hunters in the same environment.

    goalEl.addEventListener('click', () => {
      if (mapData.is_scavenger_hunt) {
        hg.views.ItemView.show(goal.type);
      } else {
        hg.views.MouseView.show(goal.type);
      }
    });

    goalsEl.append(goalEl);
  }

  mapSidebar.append(goalsEl);

  const existing = document.querySelector('.mh-improved-map-sidebar');
  if (existing) {
    existing.replaceWith(mapSidebar);
  } else {
    sidebar.append(mapSidebar);
  }
};

/**
 * Refresh the sidebar.
 */
const refreshSidebar = async () => {
  const refreshed = await refreshMap();
  if (! refreshed) {
    shouldRefresh = false;
    return;
  }

  addMapToSidebar();
};

let shouldRefresh = true;
let timeoutFive;
let timeoutTen;

/**
 * Refresh the sidebar after a turn.
 */
const refreshSidebarAfterTurn = () => {
  clearTimeout(timeoutFive);
  clearTimeout(timeoutTen);

  if (shouldRefresh) {
    timeoutFive = setTimeout(refreshSidebar, 5 * 60 * 1000);
    timeoutTen = setTimeout(refreshSidebar, 10 * 60 * 1000);
  }
};

let mapData;
let miceThumbs;
let itemThumbs;

/**
 * Initialize the sidebar module.
 */
export default async () => {
  miceThumbs = await getData('mice-thumbnails');
  itemThumbs = await getData('item-thumbnails');

  addMapToSidebar();
  onTravel(null, { callback: addMapToSidebar });

  onEvent('mh-improved-map-refreshed', addMapToSidebar);

  onTurn(() => {
    refreshSidebar();
    refreshSidebarAfterTurn();
  }, 1000);

  onRequest('users/treasuremap_v2.php', (data, request) => {
    if ('toggle_favourite_task' === request.action) {
      refreshSidebar();
    }
  });
};
