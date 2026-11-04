import { doEvent, doRequest, getMapData, setMapData } from '@utils';

/**
 * Get the remaining (uncompleted) goals.
 *
 * @param {Object} mapData The map data.
 *
 * @return {Object} The goal `type` ('item' or 'mouse') and the remaining `goals`.
 */
const getCompletedGoals = (mapData) => {
  const type = mapData?.is_scavenger_hunt ? 'item' : 'mouse';

  let goals = mapData?.is_scavenger_hunt ? mapData?.goals?.item : mapData?.goals?.mouse;
  if (!goals) {
    return { type, goals: [] };
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
  goals = goals.filter((goal) => !completedGoals.includes(goal.unique_id)).sort((a, b) => a.name.localeCompare(b.name));

  return { type, goals };
};

/**
 * Refresh the map data.
 *
 * @return {Promise} The refreshed map data.
 */
const refreshMap = async () => {
  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;

  if (!mapId) {
    return false;
  }

  let newMapData;
  try {
    newMapData = await doRequest('managers/ajax/users/treasuremap_v2.php', {
      action: 'map_info',
      map_id: mapId,
    });
  } catch (error) {
    console.error('Error refreshing map:', error); // eslint-disable-line no-console
    return false;
  }

  if (!(newMapData && newMapData?.treasure_map)) {
    return false;
  }

  // Read the previous data before storing the new data over it. This used to read a
  // sessionStorage key that nothing has written since map data moved to the cache, so it was
  // always empty and the event below fired on every refresh rather than only when the goals
  // actually changed.
  const currentMapData = await getMapData(mapId, true);

  await setMapData(mapId, newMapData.treasure_map);

  if (currentMapData) {
    const currentGoals = getCompletedGoals(currentMapData);
    const newGoals = getCompletedGoals(newMapData.treasure_map);
    if (currentGoals.goals.length !== newGoals.goals.length) {
      doEvent('mh-improved-map-refreshed');
    }
  } else {
    doEvent('mh-improved-map-refreshed');
  }

  return newMapData;
};

/**
 * Get the element holding the map view that's on screen.
 *
 * A map preview opens in a dialog overlay on top of the invites or community view, and that
 * view has its own sub-tab row (Friends / Favourites / Team / Public) earlier in the DOM. Tab
 * lookups have to be scoped to the map being shown, or they land in the listing's tabs.
 *
 * @return {Element} The preview dialog content, the map root, or the document.
 */
const getMapScope = () => {
  const root = document.querySelector('.treasureMapRootView');
  const preview = root?.querySelector('.treasureMapDialogView-overlay.active .treasureMapDialogView-content');
  if (preview?.querySelector('.treasureMapView')) {
    return preview;
  }

  return root || document;
};

export { refreshMap, getCompletedGoals, getMapScope };
