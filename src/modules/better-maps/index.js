import {
  addStyles,
  doEvent,
  getData,
  getMapData,
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

import helper from './modules/helper';

import { addSortedMapTab, hideSortedTab, showSortedTab } from './modules/tab-sorted';
import { hideGoalsTab, showGoalsTab } from './modules/tab-goals';
import { showHuntersTab } from './modules/tab-hunters';

import community from './modules/community';
import shops from './modules/shops';
import sidebar from './modules/sidebar';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const updateMapClasses = () => {
  const map = document.querySelector('.treasureMapRootView');
  if (user?.quests?.QuestRelicHunter?.maps?.length >= 2) {
    map.classList.add('mh-ui-multiple-maps');
  } else {
    map.classList.remove('mh-ui-multiple-maps');
  }
};

const updateBlockContent = (block, type) => {
  if ('environments' === type) {
    const environments = block.querySelectorAll('.treasureMapView-environment');
    const sortedEnvironments = [...environments].sort((a, b) => a.innerText.localeCompare(b.innerText));
    sortedEnvironments.forEach((env) => {
      block.append(env);
    });
  }
};

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

const interceptMapRequest = (mapId) => {
  sessionSet('map-refreshed', Date.now());

  // If we don't have data, we're done.
  if (! mapId) {
    return false;
  }

  const init = (mapData) => {
    setGlobal('mapper', {
      mapData,
      mapModel: new hg.models.TreasureMapModel(mapData),
    });

    doEvent('mapper_loaded', mapData);
    return data;
  };

  const data = getMapData(mapId, true);
  if (data) {
    return init(data);
  }

  return false;
};

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

  if (getSetting('better-maps.default-to-sorted', false)) {
    // check if the map is completed, and if so don't click the sorted tab
    if (! (map.can_claim_reward || map.is_complete)) {
      doEvent('map_sorted_tab_click', map);
    }
  } else {
    // Fire the goals click because we default to that tab.
    doEvent('map_show_goals_tab_click', map);
  }

  // Add the block classes.
  addBlockClasses();
};

const intercept = () => {
  const parentShowMap = hg.controllers.TreasureMapController.showMap;
  hg.controllers.TreasureMapController.showMap = (id = false) => {
    parentShowMap(id);
    const intercepted = interceptMapRequest(id ?? user?.quests?.QuestRelicHunter?.default_map_id);
    setTimeout(() => {
      if (! intercepted) {
        interceptMapRequest(id ?? user?.quests?.QuestRelicHunter?.default_map_id);
      }
    }, 1000);
  };

  onRequest('users/treasuremap.php', (data) => {
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

const updateRelicHunterHint = async () => {
  const relicHunter = document.querySelector('.treasureMapInventoryView-relicHunter-hint');
  if (! relicHunter) {
    return false;
  }

  if (relicHunter.getAttribute('data-travel-button-added')) {
    return true;
  }

  relicHunter.setAttribute('data-travel-button-added', true);

  const hint = relicHunter.innerText.trim();

  const relicHunterHints = await getData('relic-hunter-hints');
  // relicHunterHints is an object with each key having an array of hints.
  // Find the key that has the hint we're looking for.
  let key = false;
  Object.keys(relicHunterHints).forEach((k) => {
    if (relicHunterHints[k].includes(hint)) {
      key = k;
    }
  });

  // Returning true to make sure we don't keep trying to update the hint.
  if (! key) {
    return true;
  }

  // Find the environment that matches the key.
  environments = await getData('environments');
  const environment = environments.find((e) => e.id === key);
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
const relicHunterUpdate = () => {
  if (_showInventory) {
    return;
  }

  _showInventory = hg.controllers.TreasureMapController.showInventory;
  hg.controllers.TreasureMapController.showInventory = () => {
    _showInventory();

    // Call updateRelicHunterHint, but if it fails, try again in 250ms, but stop after 5 tries.
    let tries = 0;
    const interval = setInterval(async () => {
      tries++;
      if (await updateRelicHunterHint() || tries > 5) {
        clearInterval(interval);
      }
    }, 250);
  };
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-maps');

  // Fire the different tab clicks.
  eventRegistry.addEventListener('map_sorted_tab_click', showSortedTab);
  eventRegistry.addEventListener('map_show_goals_tab_click', showGoalsTab);
  eventRegistry.addEventListener('map_manage_allies_tab_click', showHuntersTab);
  eventRegistry.addEventListener('map_tab_click', (map) => {
    hideGoalsTab(map);
    hideSortedTab(map);
    clearStickyMouse();
  });

  // Initialize the mapper.
  eventRegistry.addEventListener('mapper_loaded', initMapper);

  intercept();

  relicHunterUpdate();
  shops();

  if (getSetting('better-maps.community')) {
    community();
  }

  if (getSetting('experiments.better-maps-helper')) {
    helper();
  }

  if (! getSetting('no-sidebar') && getSetting('better-maps.show-sidebar-goals', true)) {
    sidebar();
  }

  onDialogShow('map', () => {
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
  });

  onEvent('map_navigation_tab_click', () => {
    addBlockClasses();
    updateMapClasses();
  });

  onRequest('users/treasuremap.php', () => {
    addBlockClasses();
    updateMapClasses();
  });
};

export default {
  id: 'better-maps',
  name: 'Better Maps',
  type: 'better',
  default: true,
  description: 'Adds a number of features to maps, including showing attracting rates, a sorted tab that categorizes a variety of maps, and showing more information on the Hunters tab.',
  load: init,
  settings
};
