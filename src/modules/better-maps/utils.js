import { doRequest, sessionGet, setMapData } from '@utils';

/**
 * Get the completed goals.
 *
 * @param {Object} mapData The map data.
 *
 * @return {Array} The completed goals.
 */
const getCompletedGoals = (mapData) => {
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

  return {
    type: mapData.is_scavenger_hunt ? 'item' : 'mouse',
    goals,
  };
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
  if (currentMapData && newMapData && newMapData.treasure_map) {
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

export {
  refreshMap,
  getCompletedGoals
};
