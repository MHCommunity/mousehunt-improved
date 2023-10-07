import addStyles from './styles';
import { addSortedMapTab, hideSortedTab, showSortedTab } from './modules/tab-sorted';
import { showHuntersTab } from './modules/tab-hunters';
import { hideGoalsTab, showGoalsTab } from './modules/tab-goals';
import { addBlockClasses, getMapData, setMapData } from './map-utils';

const interceptMapRequest = (mapId) => {
  // If we don't have data, we're done.
  if (! mapId) {
    return false;
  }

  const init = (mapData) => {
    // / append the map data to the window.mhui object, keeping the other properties
    window.mhui = {
      ...window.mhui,
      mapper: {
        mapData,
        mapModel: new hg.models.TreasureMapModel(mapData),
      }
    };

    eventRegistry.doEvent('mapper_loaded', mapData);
    return data;
  };

  let data = getMapData(mapId, true);
  if (data) {
    return init(data);
  }

  return false;
};

const initMapper = (map) => {
  if (! (map && map.map_id && map.map_type)) {
    return;
  }

  // get the treasureMapRootView-content element, and if it has a loading class, wait for the class to be removed by watching the element for chagnes. once its loaded, proceed with our code
  const content = document.querySelector('.treasureMapRootView-content');
  if (content && content.classList.contains('loading')) {
    const observer = new MutationObserver((mutations, mobserver) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          ! mutation.target.classList.contains('loading')
        ) {
          mobserver.disconnect();
          // call the init function again to proceed with our code
          initMapper(map);
        }
      });
    });

    const rootOfChanges = document.querySelector('.treasureMapRootView');
    observer.observe(rootOfChanges, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }

  // Add the sorted tab.
  addSortedMapTab();

  // Add the tab click events.
  const tabs = document.querySelectorAll('.treasureMapRootView-subTab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      addBlockClasses();

      eventRegistry.doEvent('map_tab_click', map);
      eventRegistry.doEvent(`map_${tab.getAttribute('data-type')}_tab_click`, map);
    });
  });

  // Fire the goals click because we default to that tab.
  eventRegistry.doEvent('map_show_goals_tab_click', map);

  // Add the block classes.
  addBlockClasses();
};

const intercept = () => {
  const parentShowMap = hg.controllers.TreasureMapController.showMap;
  hg.controllers.TreasureMapController.showMap = (id = false) => {
    parentShowMap(id);
    const intercepted = interceptMapRequest(id ? id : user?.quests?.QuestRelicHunter?.default_map_id);
    setTimeout(() => {
      if (! intercepted) {
        interceptMapRequest(id ? id : user?.quests?.QuestRelicHunter?.default_map_id);
      }
    }, 1000);
  };

  onAjaxRequest((data) => {
    if (data.treasure_map && data.treasure_map.map_id) {
      setMapData(data.treasure_map.map_id, data.treasure_map);
    }
  }, 'managers/ajax/users/treasuremap.php', true); // eslint-disable-line no-undef
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

export default () => {
  addStyles();

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
};
