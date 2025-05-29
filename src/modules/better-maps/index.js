import {
  addStyles,
  doEvent,
  getData,
  getMapData,
  getRelicHunterLocation,
  getSetting,
  makeElement,
  onDialogShow,
  onEvent,
  onRequest,
  sessionSet,
  setGlobal,
  setMapData
} from '@utils';

import settings from './settings';

import { addSortedMapTab, hideSortedTab, showSortedTab } from './modules/tab-sorted';
import { hideGoalsTab, showGoalsTab } from './modules/tab-goals';
import { maybeShowInvitesTab } from './modules/tab-invites';
import { showHuntersTab } from './modules/tab-hunters';

import community from './modules/community';
import enhancePreviewButton from './modules/preview';
import floatingIslands from './modules/floating-islands';
import scrolls from './modules/scrolls';
import shops from './modules/shops';
import sidebar from './modules/sidebar';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Update the map classes.
 */
const updateMapClasses = () => {
  const map = document.querySelector('.treasureMapRootView');
  if (map && map.classList) {
    if (user?.quests?.QuestRelicHunter?.maps?.length >= 2) {
      map.classList.add('mh-ui-multiple-maps');
    } else {
      map.classList.remove('mh-ui-multiple-maps');
    }
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
 */
const addBlockClasses = () => {
  const rightBlocks = document.querySelectorAll('.treasureMapView-rightBlock > div');
  const leftBlocks = document.querySelectorAll('.treasureMapView-leftBlock > div');
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
 * Intercept the map request.
 *
 * @param {number} mapId The map ID.
 *
 * @return {boolean} If the map was intercepted.
 */
const interceptMapRequest = async (mapId) => {
  sessionSet('map-refreshed', Date.now());

  // If we don't have data, we're done.
  if (! mapId) {
    return false;
  }

  /**
   * Set the mapper global and fire the mapper loaded event.
   *
   * @param {Object} mapData The map data.
   *
   * @return {Object} The map data.
   */
  const init = (mapData) => {
    setGlobal('mapper', {
      mapData,
      mapModel: new hg.models.TreasureMapModel(mapData),
    });

    doEvent('mapper_loaded', mapData);
    return data;
  };

  const data = await getMapData(mapId, true);
  if (data) {
    return init(data);
  }

  return false;
};

/**
 * Initialize the mapper.
 *
 * @param {Object} map The map data.
 */
const initMapper = (map) => {
  if (! map || ! map.map_id || ! map.map_type) {
    return;
  }

  // get the treasureMapRootView-content element, and if it has a loading class, wait for the class to be removed by watching the element for changes. once its loaded, proceed with our code
  const content = document.querySelector('.treasureMapRootView-content');
  if (content && content.classList.contains('loading')) {
    const observer = new MutationObserver((mutations, mObserver) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          ! mutation.target.classList.contains('loading')
        ) {
          mObserver.disconnect();
          // call the init function again to proceed with our code
          initMapper(map);
        }
      });
    });

    const rootOfChanges = document.querySelector('.treasureMapRootView');
    observer.observe(rootOfChanges, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  // Add the sorted tab.
  addSortedMapTab();

  // Add the tab click events.
  const tabs = document.querySelectorAll('.treasureMapRootView-subTab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      addBlockClasses();

      doEvent('map_tab_click', map);
      doEvent(`map_${tab.getAttribute('data-type')}_tab_click`, map);
    });
  });

  doEvent('map_show_goals_tab_click', map);

  if (getSetting('better-maps.default-to-sorted', false) && ! map.is_complete) {
    doEvent('map_sorted_tab_click', map);
  }

  // Add the block classes.
  addBlockClasses();
};

let parentShowMap;
/**
 * Intercept the map request from the controller.
 */
const intercept = () => {
  if (parentShowMap) {
    return;
  }

  parentShowMap = hg.controllers.TreasureMapController.showMap;
  hg.controllers.TreasureMapController.showMap = async (id = false) => {
    parentShowMap(id);

    const intercepted = await interceptMapRequest(id ?? user?.quests?.QuestRelicHunter?.default_map_id);
    setTimeout(() => {
      if (! intercepted) {
        interceptMapRequest(id ?? user?.quests?.QuestRelicHunter?.default_map_id);
      }
    }, 1000);
  };

  onRequest('users/treasuremap_v2.php', (data) => {
    if (data.treasure_map && data.treasure_map.map_id) {
      setMapData(data.treasure_map.map_id, data.treasure_map);
    }
  }, true);

  onRequest('board/board.php', (data) => {
    if (data.treasure_map && data.treasure_map.map_id) {
      setMapData(data.treasure_map.map_id, data.treasure_map);
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
  environments = await getData('environments');
  const environment = environments.find((e) => e.id === relicHunterLocation.id);
  if (! environment) {
    return true;
  }

  let hintWrapper = document.querySelector('.treasureMapInventoryView-relicHunter');
  if (! hintWrapper) {
    hintWrapper = relicHunter;
  }

  makeElement('div', 'treasureMapInventoryView-relicHunter-hintSuffix', `... in ${environment.article}.`, hintWrapper);

  const travelButton = makeElement('div', ['mousehuntActionButton', 'small']);
  makeElement('span', '', 'Travel', travelButton);

  travelButton.addEventListener('click', () => {
    hg.utils.User.travel(environment.id);
  });

  hintWrapper.append(travelButton);

  return true;
};

let _showInventory;
const relicHunterUpdate = async () => {
  if (_showInventory) {
    return;
  }

  _showInventory = hg.controllers.TreasureMapController.showInventory;

  /**
   * Show the inventory.
   */
  hg.controllers.TreasureMapController.showInventory = async () => {
    _showInventory();

    // Call updateRelicHunterHint, but if it fails, try again in 250ms, but stop after 5 tries.
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
};

/**
 * Clear the cache of the map after 30 seconds.
 */
const addClearCacheTimeout = () => {
  let clearCacheTimeout;
  onDialogShow('map', async () => {
    const tabs = document.querySelectorAll('.treasureMapRootView-header-navigation-item');
    tabs.forEach((tab) => {
      const classes = [...tab.classList];

      if (classes.includes('active')) {
        doEvent('map_navigation_tab_click', classes.find((c) => c !== 'treasureMapRootView-header-navigation-item').trim());
      }

      tab.addEventListener('click', () => {
        doEvent('map_navigation_tab_click', classes.find((c) => c !== 'treasureMapRootView-header-navigation-item' && c !== 'active').trim());
      });
    });

    // Clear the map cache after 30 seconds so that we always fetch the latest map data when opening the map.
    clearCacheTimeout = setTimeout(() => {
      clearTimeout(clearCacheTimeout);
      hg.controllers.TreasureMapController.clearMapCache();
    }, 30 * 1000);
  });
};

/**
 * Clear the map cache after 10 seconds.
 */
const clearMapCache = () => {
  let clearCacheTimeout;
  onDialogShow('map', async () => {
    const tabs = document.querySelectorAll('.treasureMapRootView-header-navigation-item');
    tabs.forEach((tab) => {
      const classes = [...tab.classList];

      if (classes.includes('active')) {
        doEvent('map_navigation_tab_click', classes.find((c) => c !== 'treasureMapRootView-header-navigation-item').trim());
      }

      tab.addEventListener('click', () => {
        doEvent('map_navigation_tab_click', classes.find((c) => c !== 'treasureMapRootView-header-navigation-item' && c !== 'active').trim());
      });
    });

    // Clear the map cache after 10 seconds so that we always fetch the latest map data when opening the map.
    clearTimeout(clearCacheTimeout);
    clearCacheTimeout = setTimeout(() => {
      hg.controllers.TreasureMapController.clearMapCache();
    }, 30 * 1000); // 10 seconds.
  });
};

const addInfoClasses = (mapData) => {
  const mapRoot = document.querySelector('.treasureMapRootView-content .treasureMapView');
  if (! mapRoot) {
    return;
  }

  if (mapData?.is_complete) {
    mapRoot.classList.add('mh-ui-map-completed');
  }

  if (mapData?.is_upgradeable) {
    mapRoot.classList.add('mh-ui-map-upgradeable');
  }

  if (mapData?.is_upgraded) {
    mapRoot.classList.add('mh-ui-map-upgraded');
  }

  if (mapData?.can_claim_reward) {
    mapRoot.classList.add('mh-ui-map-claimable');
  }

  if (mapData?.can_send_invites) {
    mapRoot.classList.add('mh-ui-map-can-invite');
  }

  if (mapData?.viewing_user_is_on_map) {
    mapRoot.classList.add('mh-ui-user-on-map');
  }

  if (mapData?.is_owner) {
    mapRoot.classList.add('mh-ui-user-is-owner');
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-maps');

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

  // Initialize the mapper.
  eventRegistry.addEventListener('mapper_loaded', initMapper);

  intercept();

  addClearCacheTimeout();
  relicHunterUpdate();
  scrolls();
  shops();

  if (getSetting('better-maps.community')) {
    community();
  }

  if (! (getSetting('no-sidebar', true) && getSetting('better-maps.show-sidebar-goals', true))) {
    sidebar();
  }

  clearMapCache();

  onEvent('map_navigation_tab_click', (tab) => {
    addBlockClasses();
    updateMapClasses();
    maybeShowInvitesTab(tab);
    enhancePreviewButton();
  });

  onRequest('users/treasuremap_v2.php', () => {
    addBlockClasses();
    updateMapClasses();
    enhancePreviewButton();
  });

  floatingIslands();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-maps',
  name: 'Better Maps',
  type: 'better',
  default: true,
  description: 'Add features to maps such as updated styles, attraction rates, a sorted tab categorizing various maps, and displaying more information on the various tabs.',
  load: init,
  settings
};
