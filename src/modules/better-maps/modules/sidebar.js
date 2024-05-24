import {
  doRequest,
  getData,
  makeElement,
  onTravel,
  onTurn,
  sessionGet,
  setMapData
} from '@utils';

/**
 * Get the completed goals.
 *
 * @return {Array} The completed goals.
 */
const getCompletedGoals = () => {
  let goals = mapData?.is_scavenger_hunt ? mapData?.goals?.item : mapData?.goals?.mouse;
  if (! goals) {
    return [];
  }

  const completedGoals = [];
  const hunters = mapData?.hunters || [];
  for (const hunter of hunters) {
    const completed = mapData?.is_scavenger_hunt ? hunter?.completed_goal_ids?.item : hunter?.completed_goal_ids?.mouse;

    if (completed) {
      completedGoals.push(...completed);
    }
  }

  // filter out completed goals and sort by name
  goals = goals.filter((goal) => ! completedGoals.includes(goal.unique_id)).sort((a, b) => a.name.localeCompare(b.name));

  return goals;
};

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

  mapData = sessionGet(`mh-improved-map-cache-${mapId}`);
  if (! mapData) {
    await refreshMap();
  }

  const mapSidebar = makeElement('div', 'mh-improved-map-sidebar');
  const title = makeElement('h3', 'mh-improved-map-sidebar-title', mapData?.name?.replaceAll('Treasure Map', '') || 'Map');
  title.addEventListener('click', async () => {
    mapSidebar.classList.add('loading');

    await refreshMap();
    await addMapToSidebar();

    setTimeout(() => {
      mapSidebar.classList.remove('loading');
    }, 1000);
  });

  mapSidebar.append(title);

  const goals = getCompletedGoals(mapData);

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
 * Refresh the map data.
 *
 * @return {Promise} The refreshed map data.
 */
const refreshMap = async () => {
  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;

  if (! mapId) {
    return false;
  }

  let newMapData;
  try {
    newMapData = await doRequest('managers/ajax/users/treasuremap.php', {
      action: 'map_info',
      map_id: mapId,
    });
  } catch (error) {
    console.error('Error refreshing map:', error); // eslint-disable-line no-console
    return false;
  }

  if (! (newMapData && newMapData?.treasure_map)) {
    return false;
  }

  setMapData(mapId, newMapData.treasure_map);

  const currentMapData = sessionGet(`mh-improved-map-cache-${mapId}`);
  if (currentMapData && mapData && mapData.treasure_map) {
    const currentGoals = getCompletedGoals(currentMapData);
    const newGoals = getCompletedGoals(newMapData.treasure_map);
    if (currentGoals.length !== newGoals.length) {
      await addMapToSidebar();
    }
  } else {
    await addMapToSidebar();
  }

  mapData = newMapData.treasure_map;
  return newMapData;
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

  onTurn(() => {
    refreshSidebar();
    refreshSidebarAfterTurn();
  }, 1000);
};
