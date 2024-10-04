import {
  debuglog,
  getCurrentLocation,
  onEvent,
  onRequest,
  sessionGet,
  waitForElement
} from '@utils';
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
  'draconic_paragon',
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

  return goals.filter((goal) => ! completedGoals.includes(goal.unique_id) && toHighlight.has(goal.type));
};

const highlightSkyMap = async () => {
  await waitForElement('floatingIslandsAdventureBoardSkyMap', { maxAttempts: 100, delay: 100 });
  if (! mapGoals) {
    main();
  }

  // check if any of the goals on the map are paragons and if not, return.
  if (! mapGoals.some((goal) => goal.type.endsWith('paragon'))) {
    return; // TODO: also add check for wardens.
  }

  const edge = [...document.querySelectorAll('.floatingIslandsAdventureBoardSkyMap-powerTypes .floatingIslandsHUD-powerType')];
  const grid = [...document.querySelectorAll('.floatingIslandsAdventureBoardSkyMap-islandModContainer .floatingIslandsAdventureBoardSkyMap-islandMod')];

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

  edge.forEach((tile) => {
    tile.classList.remove('highlight-for-map');
    tile.classList.remove('extra-highlight-for-map');
    tile.classList.add('lowlight-for-map');
  });

  grid.forEach((tile) => {
    tile.classList.remove('highlight-for-map');
    tile.classList.remove('extra-highlight-for-map');
    tile.classList.add('lowlight-for-map');
  });

  // TODO: also update this to work with wardens, just skipping the power type.
  let shouldHighlightRowExtra = false;
  mapGoals.forEach((mouse) => {
    shouldHighlightRowExtra = false;

    const powerType = mouse.type.replaceAll('_paragon', '');
    if (powerType && mapByPowerType[powerType]) {
      if (! mapByPowerType[powerType].edge) {
        return;
      }

      mapByPowerType[powerType].edge.classList.add('highlight-for-map');
      mapByPowerType[powerType].edge.classList.remove('lowlight-for-map');

      mapByPowerType[powerType].tiles.forEach((tile, index) => {
        tile.classList.remove('lowlight-for-map');
        tile.classList.add('highlight-for-map');

        const mod = tile.querySelector('.floatingIslandsHUD-mod');
        if (index === 0 && mod && (
          mod.classList.contains('paragon_cache_a') ||
          mod.classList.contains('paragon_cache_b') ||
          mod.classList.contains('paragon_cache_c') ||
          mod.classList.contains('paragon_cache_d')
        )) {
          shouldHighlightRowExtra = true;
        }

        if (shouldHighlightRowExtra) {
          mapByPowerType[powerType].edge.classList.add('extra-highlight-for-map');
          tile.classList.add('extra-highlight-for-map');
        }
      });
    }
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
  if (! mapId) {
    return;
  }

  mapData = sessionGet(`mh-improved-map-cache-${mapId}`);
  if (! mapData) {
    await refreshMap();
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
