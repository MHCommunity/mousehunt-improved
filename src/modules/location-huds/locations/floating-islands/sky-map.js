import { debuglog, getCurrentLocation, getMapData, isModuleEnabled, onEvent, onRequest, waitForElement } from '@utils';

import { refreshMap } from '@/better-maps/utils';

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

const tileSelector = '.floatingIslandsAdventureBoardSkyMap-islandModContainer .floatingIslandsAdventureBoardSkyMap-islandMod';
const edgeSelector = '.floatingIslandsAdventureBoardSkyMap-powerTypes .floatingIslandsHUD-powerType';
const paragonCacheSelector = '.paragon_cache_a, .paragon_cache_b, .paragon_cache_c, .paragon_cache_d';

const hasMod = (tile, selector) => tile.matches(selector) || !!tile.querySelector(selector);

const getGridSignature = () => [...document.querySelectorAll(`${tileSelector} .floatingIslandsHUD-mod`)].map((mod) => mod.dataset.type).join(',');

const highlight = (el, extra = false) => {
  el.classList.remove('lowlight-for-map');
  el.classList.add('highlight-for-map');
  if (extra) {
    el.classList.add('extra-highlight-for-map');
  }
};

const resetSkyMap = () => {
  document.querySelectorAll('.mh-sky-map-badge, .mh-sky-map-tooltip-text, .mh-sky-map-info').forEach((el) => el.remove());
  islandAdvice = null;

  document.querySelectorAll(`${edgeSelector}, ${tileSelector}`).forEach((el) => {
    el.classList.remove('highlight-for-map', 'extra-highlight-for-map', 'lowlight-for-map', 'mh-sky-map-choose');
  });
};

const addBadge = (el, type, title = '') => {
  const badge = document.createElement('span');
  badge.className = `mh-sky-map-badge mh-sky-map-badge--${type}`;
  if (title) {
    // The game builds its "<island> selected" text from the power type's title, so the badge carries ours instead.
    badge.title = title;
  }

  el.append(badge);
};

const addTooltipLine = (tile, line) => {
  // The tile already has the game's tooltip, so add a line to it rather than stacking a second one.
  const tooltip = tile.querySelector('.mousehuntTooltip');
  if (!tooltip) {
    return;
  }

  const text = document.createElement('div');
  text.className = 'mh-sky-map-tooltip-text';
  text.textContent = line;
  tooltip.insertBefore(text, tooltip.querySelector('.mousehuntTooltip-arrow'));
};

/**
 * Show a note under the game's "<island> selected" text when the picked island isn't the best one for the map.
 */
const updateSelectedIslandInfo = () => {
  const text = document.querySelector('.floatingIslandsAdventureBoard-info span');
  if (!text) {
    return;
  }

  const selected = document.querySelector(`${edgeSelector}.active`)?.dataset.powerTypeName;
  const advice = selected && islandAdvice?.[selected];
  if (!advice || text.querySelector(`.mh-sky-map-info[data-mh-power-type="${selected}"]`)) {
    return;
  }

  // The info box only fits two lines, so our note takes the place of "You're ready to fly." A good pick keeps the game's text.
  const lineBreak = text.querySelector('br');
  if (lineBreak && advice.text) {
    while (text.lastChild !== lineBreak) {
      text.lastChild.remove();
    }

    lineBreak.remove();
  }

  const note = document.createElement('span');
  note.className = `mh-sky-map-info mh-sky-map-info--${advice.level}`;
  note.dataset.mhPowerType = selected;
  note.textContent = advice.text;
  text.append(note);
};

/**
 * Add our note as soon as the game redraws the info box, before the browser paints, so its text never flashes up.
 */
const addNoteAfterRedraw = () => {
  const container = document.querySelector('.floatingIslandsAdventureBoard-container');
  if (!container) {
    return;
  }

  const observer = new MutationObserver(() => {
    observer.disconnect();
    updateSelectedIslandInfo();
  });

  observer.observe(container, { childList: true, subtree: true, characterData: true });

  // If the game doesn't redraw anything, stop watching.
  setTimeout(() => {
    observer.disconnect();
    updateSelectedIslandInfo();
  }, 500);
};

/**
 * Work out, for each power type, whether its island is the best pick, a slower pick, or no use for the map.
 *
 * @param {Object}   powerTypes Power type to edge and tiles, first tile first.
 * @param {Function} isTarget   Whether a tile has what we're after.
 * @param {Object}   messages   The text to show for slow and missing picks.
 *
 * @return {Object|null} Advice keyed by power type, or null if no island has what we're after.
 */
const getIslandAdvice = (powerTypes, isTarget, messages) => {
  const advice = {};
  let hasGoodPick = false;

  Object.entries(powerTypes).forEach(([type, { tiles }]) => {
    if (tiles[0] && isTarget(type, tiles[0])) {
      hasGoodPick = true;
      advice[type] = { level: 'good', text: '' };
    } else if (tiles.some((tile) => tile && isTarget(type, tile))) {
      hasGoodPick = true;
      advice[type] = { level: 'tip', text: messages.slow };
    } else {
      advice[type] = { level: 'warning', text: messages.missing };
    }
  });

  return hasGoodPick ? advice : null;
};

const highlightSkyMap = async () => {
  const ready = await waitForElement(tileSelector, { maxAttempts: 100, delay: 100 });
  if (!ready) {
    return;
  }

  if (!mapGoals) {
    main();
    return;
  }

  resetSkyMap();
  lastGridSignature = getGridSignature();

  const siteAtts = user?.quests?.QuestFloatingIslands?.hunting_site_atts || {};
  const wardenStones = siteAtts.warden_stones || {};

  // Each warden only shows up on its own shrine, and only until you've caught it this run.
  const wardens = mapGoals
    .filter((goal) => goal.type.endsWith('_warden'))
    .map((goal) => ({ goal, shrine: `${goal.type.replace('_warden', '')}_shrine` }))
    .filter(({ shrine }) => !wardenStones[shrine]);

  // Paragons only come from paragon caches, which you can't get to until all four wardens are caught.
  const paragons = (siteAtts.sky_wardens_caught || 0) >= 4 ? mapGoals.filter((goal) => goal.type.endsWith('_paragon')) : [];

  const edge = [...document.querySelectorAll(edgeSelector)];
  const grid = [...document.querySelectorAll(tileSelector)];

  /**
   * The grid is laid out like so, and each power type's island uses the tiles in its row (left to right) or column (bottom up), so the first tile is the one next to its icon:
   * <arcane>        [ ]    [ ]    [ ]     [ ]
   * <forgotten>     [ ]    [ ]    [ ]     [ ]
   * <hydro>         [ ]    [ ]    [ ]     [ ]
   * <shadow>        [ ]    [ ]    [ ]     [ ]
   * ........   <draconic> <law> <physc> <tactical>.
   */
  const powerTypes = {
    arcane: { edge: edge[0], tiles: [grid[0], grid[1], grid[2], grid[3]] },
    forgotten: { edge: edge[1], tiles: [grid[4], grid[5], grid[6], grid[7]] },
    hydro: { edge: edge[2], tiles: [grid[8], grid[9], grid[10], grid[11]] },
    shadow: { edge: edge[3], tiles: [grid[12], grid[13], grid[14], grid[15]] },
    draconic: { edge: edge[4], tiles: [grid[12], grid[8], grid[4], grid[0]] },
    law: { edge: edge[5], tiles: [grid[13], grid[9], grid[5], grid[1]] },
    physical: { edge: edge[6], tiles: [grid[14], grid[10], grid[6], grid[2]] },
    tactical: { edge: edge[7], tiles: [grid[15], grid[11], grid[7], grid[3]] },
  };

  const shrineTiles = wardens.map(({ goal, shrine }) => ({ goal, tiles: grid.filter((tile) => hasMod(tile, `.${shrine}`)) }));

  const paragonPowerTypes = paragons
    .map((goal) => ({ goal, powerType: powerTypes[goal.type.replace('_paragon', '')] }))
    .filter(({ powerType }) => powerType?.edge && powerType.tiles.some((tile) => tile && hasMod(tile, paragonCacheSelector)));

  // If none of the islands can attract a mouse we need, leave the sky map alone.
  if (!shrineTiles.some(({ tiles }) => tiles.length) && !paragonPowerTypes.length) {
    return;
  }

  [...edge, ...grid].forEach((el) => el.classList.add('lowlight-for-map'));

  shrineTiles.forEach(({ goal, tiles }) => {
    tiles.forEach((tile) => {
      highlight(tile, true);
      addBadge(tile, 'needed');
      addTooltipLine(tile, `${goal.name} needed for map`);
    });

    // A power type whose island starts on the shrine is the one to pick.
    Object.values(powerTypes).forEach((powerType) => {
      if (!powerType.edge || !tiles.includes(powerType.tiles[0])) {
        return;
      }

      highlight(powerType.edge, true);
      powerType.edge.classList.add('mh-sky-map-choose');
    });
  });

  paragonPowerTypes.forEach(({ goal, powerType }) => {
    highlight(powerType.edge, true);
    powerType.tiles.filter(Boolean).forEach((tile) => highlight(tile, hasMod(tile, paragonCacheSelector)));
    addBadge(powerType.edge, 'needed', `${goal.name} needed for map`);
  });

  if (shrineTiles.some(({ tiles }) => tiles.length)) {
    const neededShrines = shrineTiles.flatMap(({ tiles }) => tiles);
    islandAdvice = getIslandAdvice(powerTypes, (type, tile) => neededShrines.includes(tile), {
      slow: 'Progress is fastest if the shrine is the first tile.',
      missing: 'This island has no warden.\nAre you sure?',
    });
  } else {
    const paragonTypes = new Set(paragonPowerTypes.map(({ goal }) => goal.type.replace('_paragon', '')));
    islandAdvice = getIslandAdvice(powerTypes, (type, tile) => paragonTypes.has(type) && hasMod(tile, paragonCacheSelector), {
      slow: 'Progress is fastest if the paragon cache is the first tile.',
      missing: 'This island has no paragon.\nAre you sure?',
    });
  }

  updateSelectedIslandInfo();
};

/**
 * After a reroll, wait for the game to redraw the sky map before marking it up again.
 */
const redrawAfterReroll = async () => {
  for (let attempt = 0; attempt < 30; attempt++) {
    const signature = getGridSignature();
    if (signature && (signature !== lastGridSignature || !document.querySelector('.mh-sky-map-badge, .lowlight-for-map'))) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  main();
};

const main = async () => {
  // The map highlights are part of Better Maps, so they only show when it's on.
  if (!isModuleEnabled('better-maps')) {
    return;
  }

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
let lastGridSignature = '';
let islandAdvice = null;
let hasClickListener = false;

/**
 * Initialize the sky map highlights.
 */
export default () => {
  onEvent('dialog-show-default-floatingislandsadventureboard-floatingislandsdialog-wide-skymap', main);

  // The game redraws its "<island> selected" text when a power type is picked, so add our note once it has.
  // Listen in the capture phase, as the game's click handler stops the event from bubbling.
  if (!hasClickListener) {
    hasClickListener = true;
    document.addEventListener(
      'click',
      (event) => {
        if (islandAdvice && event.target.closest(edgeSelector)) {
          addNoteAfterRedraw();
        }
      },
      true
    );
  }

  onRequest('environment/floating_islands.php', (resp, req) => {
    if ('reroll_sky_map' === req?.action) {
      redrawAfterReroll();
    }
  });
};
