import { debuglog, getCurrentLocation, getMapData, onEvent, onRequest, waitForElement } from '@utils';
import { refreshMap } from '../utils';

const toHighlight = new Set([
  'arcane_paragon',
  'draconic_paragon',
  'forgotten_paragon',
  'hydro_paragon',
  'law_paragon',
  'physical_paragon',
  'shadow_paragon',
  'tactical_paragon',
  'fog_warden',
  'frost_warden',
  'rain_warden',
  'wind_warden',
]);

const getSkyMapMice = () => {
  const goals = mapData?.goals?.mouse || [];
  const completedGoals = [];

  const hunters = mapData?.hunters || [];
  for (const hunter of hunters) {
    const hunterCompleted = hunter?.completed_goal_ids?.mouse;
    if (hunterCompleted) {
      completedGoals.push(...hunterCompleted);
    }
  }

  return goals.filter((goal) => !completedGoals.includes(goal.unique_id) && toHighlight.has(goal.type));
};

const paragonCacheSelector = '.paragon_cache_a, .paragon_cache_b, .paragon_cache_c, .paragon_cache_d';

const hasMod = (tile, selector) => tile.matches(selector) || !!tile.querySelector(selector);

const highlightSkyMap = async () => {
  await waitForElement('#floatingIslandsAdventureBoardSkyMap', { maxAttempts: 100, delay: 100 });
  if (!mapGoals) {
    main();
    return;
  }

  // Paragons show up on their power type's islands when there's a paragon cache, and wardens show up on islands with their shrine.
  const powerTypes = mapGoals.filter((goal) => goal.type.endsWith('_paragon')).map((goal) => goal.type.replace('_paragon', ''));
  const shrineSelectors = mapGoals.filter((goal) => goal.type.endsWith('_warden')).map((goal) => `.${goal.type.replace('_warden', '')}_shrine`);

  if (!powerTypes.length && !shrineSelectors.length) {
    return;
  }

  const edge = [...document.querySelectorAll('.floatingIslandsAdventureBoardSkyMap-powerTypes .floatingIslandsHUD-powerType')];
  const grid = [...document.querySelectorAll('.floatingIslandsAdventureBoardSkyMap-islandModContainer .floatingIslandsAdventureBoardSkyMap-islandMod')];

  const relevantSelectors = [...shrineSelectors];
  if (powerTypes.length) {
    relevantSelectors.push(paragonCacheSelector);
  }

  // If none of the islands can attract a mouse we need, leave the sky map alone.
  if (!grid.some((tile) => hasMod(tile, relevantSelectors.join(', ')))) {
    return;
  }

  /**
   * The grid is laid out like so:
   * <arcane>        [ ]    [ ]    [ ]     [ ]
   * <forgotten>     [ ]    [ ]    [ ]     [ ]
   * <hydro>         [ ]    [ ]    [ ]     [ ]
   * <shadow>        [ ]    [ ]    [ ]     [ ]
   * ........   <draconic> <law> <physc> <tactical>.
   */

  // We want to make arrays so we can easily highlight different power type tiles.

  const mapByPowerType = {
    arcane: {
      edge: edge[0],
      tiles: [grid[0], grid[1], grid[2], grid[3]],
    },
    forgotten: {
      edge: edge[1],
      tiles: [grid[4], grid[5], grid[6], grid[7]],
    },
    hydro: {
      edge: edge[2],
      tiles: [grid[8], grid[9], grid[10], grid[11]],
    },
    shadow: {
      edge: edge[3],
      tiles: [grid[12], grid[13], grid[14], grid[15]],
    },
    draconic: {
      edge: edge[4],
      tiles: [grid[0], grid[4], grid[8], grid[12]],
    },
    law: {
      edge: edge[5],
      tiles: [grid[1], grid[5], grid[9], grid[13]],
    },
    physical: {
      edge: edge[6],
      tiles: [grid[2], grid[6], grid[10], grid[14]],
    },
    tactical: {
      edge: edge[7],
      tiles: [grid[3], grid[7], grid[11], grid[15]],
    },
  };

  [...edge, ...grid].forEach((tile) => {
    tile.classList.remove('highlight-for-map');
    tile.classList.remove('extra-highlight-for-map');
    tile.classList.add('lowlight-for-map');
  });

  const highlight = (el, extra = false) => {
    el.classList.remove('lowlight-for-map');
    el.classList.add('highlight-for-map');
    if (extra) {
      el.classList.add('extra-highlight-for-map');
    }
  };

  powerTypes.forEach((powerType) => {
    const row = mapByPowerType[powerType];
    if (!row?.edge) {
      return;
    }

    const tiles = row.tiles.filter(Boolean);
    const cacheTiles = tiles.filter((tile) => hasMod(tile, paragonCacheSelector));

    highlight(row.edge, cacheTiles.length > 0);
    tiles.forEach((tile) => highlight(tile, cacheTiles.includes(tile)));
  });

  shrineSelectors.forEach((selector) => {
    grid.filter((tile) => hasMod(tile, selector)).forEach((tile) => highlight(tile, true));
  });
};

const main = async () => {
  debuglog('highlighting');
  if ('floating_islands' !== getCurrentLocation()) {
    return;
  }

  if ('launch_pad_island' !== user?.quests?.QuestFloatingIslands?.hunting_site_atts?.island_type) {
    return;
  }

  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;
  if (!mapId) {
    return;
  }

  // See sidebar.js: this read targeted a sessionStorage key nothing writes any more, and
  // refreshMap() never handed its data back, so mapData was always unset here.
  mapData = await getMapData(mapId, true);
  if (!mapData) {
    const refreshed = await refreshMap();
    mapData = refreshed?.treasure_map || false;
  }

  if (!mapData) {
    return;
  }

  if (mapData?.is_scavenger_hunt) {
    return;
  }

  mapGoals = getSkyMapMice();

  highlightSkyMap();
};

let mapData;
let mapGoals;

/**
 * Initialize the module.
 */
export default () => {
  onEvent('dialog-show-default-floatingislandsadventureboard-floatingislandsdialog-wide-skymap', main);

  onRequest('environment/floating_islands.php', (resp, req) => {
    if ('reroll_sky_map' === req?.action) {
      highlightSkyMap();
    }
  });
};
