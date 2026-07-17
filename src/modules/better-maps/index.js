import {
  addMapPreviewListeners,
  addOnboardingTip,
  addStyles,
  doEvent,
  getData,
  getGlobal,
  getMapData,
  getRelicHunterLocation,
  getSetting,
  makeElement,
  makeMhButton,
  onDialogHide,
  onDialogShow,
  onEvent,
  onRequest,
  sessionSet,
  setGlobal,
  setMapData
} from '@utils';

import settings from './settings';

import { addSortedMapTab, hideSortedTab, mapHasGroup, showSortedTab } from './modules/tab-sorted';
import { hideGoalsTab, showGoalsTab } from './modules/tab-goals';
import { maybeShowInvitesTab } from './modules/tab-invites';
import { showHuntersTab } from './modules/tab-hunters';

import { updateScrollsMarkup, updateSubTabListeners } from './modules/scrolls';
import catchDates from './modules/catch-dates';
import draggableHighlight from './modules/draggable-highlight';
import enhancePreviewButton from './modules/preview';
import floatingIslands from './modules/floating-islands';
import sidebar from './modules/sidebar';
import { updateCommunityListings } from './modules/community';
import { updateShopsMarkup } from './modules/shops';

import { createMapRuntime } from './runtime';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;
const mapRuntime = createMapRuntime();
const navigationRoots = new WeakMap();
const defaultedRoots = new WeakMap();
const initializedGoalsTabs = new WeakSet();

/**
 * Add a one-time notice below the Sorted tab.
 */
const addSortedTabNotice = () => {
  addOnboardingTip({
    step: 'better-maps-sorted-tab',
    anchor: '.treasureMapRootView-subTab.sorted-map-tab',
    title: 'About the Sorted tab',
    content: 'This view groups the map\'s mice by stage or category, making it easier to see what to hunt next.',
  });
};

/**
 * Update the map classes.
 *
 * @param {Document|Element} root The map root or document.
 */
const updateMapClasses = (root = document) => {
  const map = root.matches?.('.treasureMapRootView') ? root : root.querySelector('.treasureMapRootView');
  if (map && map.classList) {
    if (user?.quests?.QuestRelicHunter?.maps?.length >= 2) {
      map.classList.add('mh-ui-multiple-maps');
    } else {
      map.classList.remove('mh-ui-multiple-maps');
    }
  }
};

const addMapClassesToPreview = () => {
  const preview = document.querySelector('.treasureMapDialogView-overlay .treasureMapDialogView');
  if (preview) {
    preview.classList.add('mh-ui-map-preview');
  }

  const tooltip = document.querySelector('.treasureMapTooltipView');
  if (tooltip) {
    tooltip.classList.add('mh-ui-map-preview-tooltip');
  }
};

const removeMapClassesFromPreview = () => {
  const tooltip = document.querySelector('.treasureMapTooltipView.mh-ui-map-preview-tooltip');
  if (tooltip) {
    tooltip.classList.remove('mh-ui-map-preview-tooltip');
  }
};

/**
 * Update the block content.
 *
 * @param {Element} block The block element.
 * @param {string}  type  The type of block.
 */
const updateBlockContent = (block, type) => {
  if ('environments' === type) {
    const environments = block.querySelectorAll('.treasureMapView-environment');
    const sortedEnvironments = [...environments].sort((a, b) => a.innerText.localeCompare(b.innerText));
    sortedEnvironments.forEach((env) => {
      block.append(env);
    });
  }
};

/**
 * Add block classes to the map.
 *
 * @param {Document|Element} root The map root or document.
 */
const addBlockClasses = (root = document) => {
  const rightBlocks = root.querySelectorAll('.treasureMapView-rightBlock > div');
  const leftBlocks = root.querySelectorAll('.treasureMapView-leftBlock > div');
  const blocks = [...rightBlocks, ...leftBlocks];

  let prevBlockType = '';
  blocks.forEach((block) => {
    if (block.classList.contains('treasureMapView-block-title')) {
      const blockType = block.innerText
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll(/[^a-z-]/g, '')
        .replace('--', '-')
        .replace('goalssearch', 'goals');
      block.classList.add(`mh-ui-${blockType}-title`);
      updateBlockContent(block, `${blockType}-title`);

      prevBlockType = blockType;
    } else {
      block.classList.add(`mh-ui-${prevBlockType}-block`);
      updateBlockContent(block, prevBlockType);
    }
  });
};

/**
 * Publish map data to compatibility consumers and the render runtime.
 *
 * @param {Object} mapData The map data.
 * @param {string} reason  The render reason.
 *
 * @return {Object} The published map data.
 */
const publishMapData = (mapData, reason = 'map-data') => {
  setGlobal('mapper', {
    mapData,
    mapModel: new hg.models.TreasureMapModel(mapData),
  });

  doEvent('mapper_loaded', mapData);
  mapRuntime.queueRender({ map: mapData, reason });
  return mapData;
};

/**
 * Fetch and publish data for the map currently being shown.
 *
 * @param {string|number} mapId     The map to fetch.
 * @param {Function}      isCurrent Whether this request remains current.
 *
 * @return {Promise<Object|boolean>} The published map data, if current.
 */
const interceptMapRequest = async (mapId, isCurrent = () => true) => {
  sessionSet('map-refreshed', Date.now());

  // If we don't have data, we're done.
  if (! mapId) {
    return false;
  }

  const data = await getMapData(mapId, true);
  if (data && isCurrent()) {
    return publishMapData(data, 'map-fetch');
  }

  return false;
};

let parentShowMap;
let defaultMapId;

// The map the dialog was last asked to show, or null when it's closed. Responses for any
// other map must not take over the display: the sidebar refreshes the *default* map on
// every turn (see refreshMap in ./utils), which would otherwise re-decorate an open
// dialog with a different map's goals, classes and quick-invite target.
let activeMapId = null;

/**
 * Check whether a map response is for the map currently on screen.
 *
 * @param {string|number} mapId The map ID from the response.
 *
 * @return {boolean} Whether the map is the one being displayed.
 */
const isActiveMap = (mapId) => {
  return Boolean(activeMapId) && `${activeMapId}` === `${mapId}`;
};
let mapRequestGeneration = 0;
let mapRecoveryTimeouts = [];

/**
 * Cancel delayed map-data recovery for the current dialog session.
 */
const clearMapRecovery = () => {
  mapRecoveryTimeouts.forEach((timeout) => clearTimeout(timeout));
  mapRecoveryTimeouts = [];
};

/**
 * Fetch map data again while the originally requested map remains current.
 *
 * @param {string|number} mapId      The map being shown.
 * @param {number}        generation Request generation that owns the retry.
 */
const recoverMapData = (mapId, generation) => {
  clearMapRecovery();
  mapRecoveryTimeouts = [250, 1000, 2500, 5000].map((delay) => setTimeout(async () => {
    if (generation !== mapRequestGeneration) {
      return;
    }

    if (`${getGlobal('mapper')?.mapData?.map_id}` === `${mapId}`) {
      clearMapRecovery();
      return;
    }

    const data = await getMapData(mapId, true);
    if (generation !== mapRequestGeneration || ! data) {
      return;
    }

    publishMapData(data, 'map-recovery');
    clearMapRecovery();
  }, delay));
};

/**
 * Route a treasure-map response to its matching surface implementation.
 *
 * @param {Object} response The response payload.
 * @param {Object} request  The request payload.
 */
async function updateMapSurface(response, request) {
  if ('get_inventory' === request?.action) {
    await updateInventorySurface();
  } else if ('get_shops' === request?.action) {
    await updateShopsMarkup();
  } else if ('get_listings' === request?.action && getSetting('better-maps.community', true)) {
    await updateCommunityListings(response, request);
  }
}
/**
 * Intercept the map request from the controller.
 *
 * @param {number} retries Number of times we've waited for the controller.
 */
const intercept = (retries = 0) => {
  if (parentShowMap) {
    return;
  }

  // The controller may not be registered yet if we loaded very early.
  if (! hg?.controllers?.TreasureMapController?.showMap) {
    if (retries < 10) {
      setTimeout(() => intercept(retries + 1), 500);
    }

    return;
  }

  parentShowMap = hg.controllers.TreasureMapController.showMap;
  hg.controllers.TreasureMapController.showMap = function (id = false) {
    const result = Reflect.apply(parentShowMap, this, arguments);

    const mapId = id || defaultMapId;
    activeMapId = mapId;
    const requestGeneration = ++mapRequestGeneration;
    clearMapRecovery();
    interceptMapRequest(mapId, () => requestGeneration === mapRequestGeneration).then((data) => {
      if (mapId && requestGeneration === mapRequestGeneration && ! data) {
        recoverMapData(mapId, requestGeneration);
      }

      return data;
    }).catch(() => {
      if (requestGeneration === mapRequestGeneration) {
        recoverMapData(mapId, requestGeneration);
      }

      return null;
    });
    return result;
  };

  onRequest('users/treasuremap_v2.php', async (data, request) => {
    hg.controllers.TreasureMapController.clearMapCache();
    if (data.treasure_map && data.treasure_map.map_id) {
      await setMapData(data.treasure_map.map_id, data.treasure_map);

      if (isActiveMap(data.treasure_map.map_id)) {
        publishMapData(data.treasure_map, 'treasure-map-request');
      }
    }

    await updateMapSurface(data, request);

    // Only re-run enhancements while the map dialog is open. Background map
    // refreshes fire every turn; queueing a render with no mounted map root just
    // arms a whole-document observer that can never become ready.
    if (activeMapId) {
      runMapEnhancements();
    }
  }, true);

  onRequest('board/board.php', async (data) => {
    hg.controllers.TreasureMapController.clearMapCache();
    if (data.treasure_map && data.treasure_map.map_id) {
      await setMapData(data.treasure_map.map_id, data.treasure_map);

      if (isActiveMap(data.treasure_map.map_id)) {
        publishMapData(data.treasure_map, 'board-request');
      }
    }
  }, true);
};

/**
 * Clear the sticky mouse.
 */
const clearStickyMouse = () => {
  const sticky = document.querySelector('.treasureMapView-highlight');
  if (sticky) {
    sticky.classList.remove('sticky');
    sticky.classList.remove('active');
  }

  const mapGroupGoal = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (mapGroupGoal) {
    mapGroupGoal.forEach((goal) => {
      goal.classList.remove('sticky');
    });
  }
};

/**
 * Bind one delegated navigation listener to a mounted map root.
 *
 * @param {Object} model The current render model.
 */
const bindMapNavigation = (model) => {
  const existing = navigationRoots.get(model.root);
  if (existing) {
    existing.map = model.map;
    return;
  }

  const state = { map: model.map };
  navigationRoots.set(model.root, state);

  const activeNavigation = model.root.querySelector('.treasureMapRootView-header-navigation-item.active');
  if (activeNavigation) {
    const type = [...activeNavigation.classList].find((className) => ! ['treasureMapRootView-header-navigation-item', 'active'].includes(className));
    if (type) {
      doEvent('map_navigation_tab_click', type);
    }
  }

  model.root.addEventListener('click', (event) => {
    const subtab = event.target.closest('.treasureMapRootView-subTab');
    if (subtab && model.root.contains(subtab)) {
      addBlockClasses(model.root);
      doEvent('map_tab_click', state.map);
      doEvent(`map_${subtab.getAttribute('data-type')}_tab_click`, state.map);
      return;
    }

    const navigation = event.target.closest('.treasureMapRootView-header-navigation-item');
    if (! navigation || ! model.root.contains(navigation)) {
      return;
    }

    const type = [...navigation.classList].find((className) => ! ['treasureMapRootView-header-navigation-item', 'active'].includes(className));
    if (type) {
      doEvent('map_navigation_tab_click', type);
    }
  });
};

/**
 * Register the visible Better Maps render order in one place.
 */
const configureMapRuntime = () => {
  mapRuntime.register('structure', 'sorted-tab', async ({ root, map }) => {
    if (! map) {
      return;
    }

    if (! map.is_complete && ! map.can_claim_reward) {
      // A map update rebuilds the header, destroying our tab and re-selecting Goals.
      // addSortedMapTab() only reports true when it had to (re)create the tab, so that's
      // also the signal that the game reset the tab selection and the default needs to be
      // applied again. Clicking Goals leaves the tab in place, so this won't override a
      // deliberate choice.
      if (await addSortedMapTab()) {
        defaultedRoots.delete(root);
      }

      if (mapHasGroup(map)) {
        addSortedTabNotice();
      }
    }

    // Map responses can re-run this render session without rebuilding the Goals
    // tab. Its setup is not a refresh hook, so run it once per tab instance;
    // subsequent user clicks still flow through the delegated navigation handler.
    const goalsTab = root.querySelector('.treasureMapRootView-subTab[data-type="goals"]');
    if (goalsTab && ! initializedGoalsTabs.has(goalsTab)) {
      initializedGoalsTabs.add(goalsTab);
      doEvent('map_show_goals_tab_click', map);
    }
  });

  mapRuntime.register('state-classes', 'map-state', ({ root, map }) => {
    updateMapClasses(root);
    addInfoClasses(map, root);
  });

  mapRuntime.register('navigation', 'map-navigation', bindMapNavigation);

  mapRuntime.register('content', 'map-content', ({ root }) => {
    addBlockClasses(root);
    enhancePreviewButton();
    maybeShowInvitesTab();
  });

  mapRuntime.register('interactions', 'default-tab', async (model) => {
    const { map, root } = model;
    if (! map || `${defaultedRoots.get(root)}` === `${map.map_id}`) {
      return;
    }

    defaultedRoots.set(root, map.map_id);
    const defaultToSorted = getSetting('better-maps.default-to-sorted', false) ||
      (getSetting('better-maps.default-to-sorted-if-map-group-exists', true) && mapHasGroup(map));

    if (! defaultToSorted || map.is_complete || map.can_claim_reward) {
      return;
    }

    const newMapData = await getMapData(map.map_id, true);
    if (model.isCurrent() && newMapData && ! newMapData.is_complete && ! newMapData.can_claim_reward) {
      showSortedTab(map);
    }
  });
};

/**
 * Add the info and travel button to the relic hunter hint.
 *
 * @return {boolean} If the relic hunter hint was updated.
 */
const updateRelicHunterHint = async () => {
  const relicHunter = document.querySelector('.treasureMapInventoryView-relicHunter-hint');
  if (! relicHunter) {
    return false;
  }

  if (relicHunter.getAttribute('data-travel-button-added')) {
    return true;
  }

  const relicHunterLocation = await getRelicHunterLocation();
  if (! relicHunterLocation || ! relicHunterLocation.id || ! relicHunterLocation.name || 'Unknown' === relicHunterLocation.name) {
    const relicHunterHints = await getData('relic-hunter-hints');

    const foundLocation = Object.keys(relicHunterHints).find((key) => {
      return relicHunterHints[key].includes(relicHunter.textContent.trim());
    });

    relicHunterLocation.id = foundLocation;
  }

  if (! relicHunterLocation.id || 'unknown' === relicHunterLocation.id) {
    return false;
  }

  relicHunter.setAttribute('data-travel-button-added', true);

  // Find the environment that matches the key.
  const environments = await getData('environments');
  const environment = environments.find((e) => e.id === relicHunterLocation.id);
  if (! (environment && environment.id)) {
    return true;
  }

  let hintWrapper = document.querySelector('.treasureMapInventoryView-relicHunter');
  if (! hintWrapper) {
    hintWrapper = relicHunter;
  }

  makeElement('div', 'treasureMapInventoryView-relicHunter-hintSuffix', `... in ${environment.article}.`, hintWrapper);

  makeMhButton({
    text: 'Travel',
    size: 'small',
    callback: () => {
      hg.utils.User.travel(environment.id);
    },
    appendTo: hintWrapper,
  });

  return true;
};

const updateInventorySurface = async () => {
  await updateSubTabListeners();
  updateScrollsMarkup();

  let didRelicHunter = await updateRelicHunterHint();
  if (didRelicHunter) {
    return;
  }

  let tries = 0;
  const interval = setInterval(async () => {
    tries++;
    didRelicHunter = await updateRelicHunterHint();
    if (didRelicHunter || tries >= 5) {
      clearInterval(interval);
    }
  }, 500);
};

let originalShowInventory;
let originalShowShops;
const installSurfaceHooks = (retries = 0) => {
  // The controller may not be registered yet if we loaded very early. Without this the
  // dereference below throws and aborts the rest of init(), taking the sidebar, catch
  // dates, draggable highlight and the dialog-hide reset down with it.
  if (! hg?.controllers?.TreasureMapController?.showInventory) {
    if (retries < 10) {
      setTimeout(() => installSurfaceHooks(retries + 1), 500);
    }

    return;
  }

  if (! originalShowInventory) {
    originalShowInventory = hg.controllers.TreasureMapController.showInventory;
    hg.controllers.TreasureMapController.showInventory = function () {
      const result = Reflect.apply(originalShowInventory, this, arguments);
      updateInventorySurface();
      return result;
    };
  }

  if (! originalShowShops) {
    originalShowShops = hg.controllers.TreasureMapController.showShops;
    hg.controllers.TreasureMapController.showShops = function () {
      const result = Reflect.apply(originalShowShops, this, arguments);
      updateShopsMarkup();
      return result;
    };
  }
};

let clearCacheTimeout = null;

/**
 * Schedule one cache clear for the current map dialog session.
 */
const scheduleMapCacheClear = () => {
  clearTimeout(clearCacheTimeout);
  clearCacheTimeout = setTimeout(() => {
    hg.controllers.TreasureMapController.clearMapCache();
    clearCacheTimeout = null;
  }, 30 * 1000);
};

const addInfoClasses = (mapData, root = document) => {
  const mapRoot = root.querySelector('.treasureMapRootView-content .treasureMapView') || root.querySelector('.treasureMapView');
  if (! mapRoot) {
    return;
  }

  const classes = {
    'mh-ui-map-completed': mapData?.is_complete,
    'mh-ui-map-upgradeable': mapData?.is_upgradeable,
    'mh-ui-map-upgraded': mapData?.is_upgraded,
    'mh-ui-map-claimable': mapData?.can_claim_reward,
    'mh-ui-map-can-invite': mapData?.can_send_invites,
    'mh-ui-user-on-map': mapData?.viewing_user_is_on_map,
    'mh-ui-user-is-owner': mapData?.is_owner,
  };

  Object.entries(classes).forEach(([className, enabled]) => {
    mapRoot.classList.toggle(className, Boolean(enabled));
  });
};

const runMapEnhancements = () => {
  const map = getGlobal('mapper')?.mapData || null;

  // Until this map's own fetch resolves, the global mapper still holds whichever map was
  // open before, so rendering with it would build the tabs -- including Sorted -- from the
  // previous map's goals. Render without a map instead and let the fetch queue the real one.
  const isStale = map && activeMapId && ! isActiveMap(map.map_id);

  mapRuntime.queueRender({ map: isStale ? null : map, reason: 'enhancement-requested' });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'better-maps');
  configureMapRuntime();

  // Fire the different tab clicks.
  eventRegistry.addEventListener('map_sorted_tab_click', (map) => {
    addInfoClasses(map);
    showSortedTab(map);
  });
  eventRegistry.addEventListener('map_show_goals_tab_click', (map) => {
    addInfoClasses(map);
    showGoalsTab(map);
  });
  eventRegistry.addEventListener('map_manage_allies_tab_click', (map) => {
    addInfoClasses(map);
    showHuntersTab(map);
  });
  eventRegistry.addEventListener('map_tab_click', (map) => {
    hideGoalsTab(map);
    hideSortedTab(map);
    clearStickyMouse();
    addInfoClasses(map);
  });

  intercept();

  installSurfaceHooks();

  // Only add map goals to the sidebar when there's a sidebar to add them to and they've been
  // asked for. This read as `! (no-sidebar && show-sidebar-goals)`, which meant turning the
  // goals setting *off* switched the sidebar on.
  if (! getSetting('no-sidebar', true) && getSetting('better-maps.show-sidebar-goals', true)) {
    sidebar();
  }

  if (getSetting('better-maps.catch-dates', false)) {
    catchDates();
  }

  if (getSetting('better-maps.draggable-highlight')) {
    draggableHighlight();
  }

  onEvent('map_navigation_tab_click', runMapEnhancements);

  addMapPreviewListeners();
  onEvent('map_show_map_preview', addMapClassesToPreview);
  onEvent('map_hide_map_preview', removeMapClassesFromPreview);

  defaultMapId = user?.quests?.QuestRelicHunter?.default_map_id;
  onRequest('*', () => {
    defaultMapId = user?.quests?.QuestRelicHunter?.default_map_id;
  }, true);

  onDialogShow('map', () => {
    runMapEnhancements();
    scheduleMapCacheClear();
  });

  onDialogHide(() => {
    clearTimeout(clearCacheTimeout);
    clearCacheTimeout = null;
    mapRequestGeneration++;
    activeMapId = null;
    clearMapRecovery();
    mapRuntime.reset();
  }, 'map');

  floatingIslands();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-maps',
  name: 'Better Maps',
  type: 'locations-maps-travel',
  default: true,
  description: 'Add features to maps such as updated styles, attraction rates, a sorted tab categorizing various maps, and displaying more information on the various tabs.',
  load: init,
  settings
};
