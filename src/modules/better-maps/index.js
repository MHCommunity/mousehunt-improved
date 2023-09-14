import mouseGroups from '../../data/mice-map-groups.json';

import styles from './styles';

import { getMapData, setMapData } from './utils';

import addConsolationPrizes from './modules/consolation-prizes';
import hunters from './modules/hunters';
import mapper from './modules/mapper';
import scavenger from './modules/scavenger';
import sidebar from './modules/sidebar';

const addStatBarListener = () => {
  const statMapBar = document.querySelector('.mousehuntHud-userStat.treasureMap');
  if (statMapBar) {
    statMapBar.removeEventListener('click', processStatsBarClick);
    statMapBar.addEventListener('click', processStatsBarClick);
  }
};

const processStatsBarClick = () => {
  const mapId = user?.quests?.QuestRelicHunter?.default_map_id; // eslint-disable-line no-undef
  if (mapId) {
    interceptMapRequest(mapId);
  }
};

const addProfileListener = () => {
  if ('HunterProfile' === getCurrentPage()) { // eslint-disable-line
    const profileLink = document.querySelector('.hunterInfoView-treasureMaps-left-currentMap-image');
    if (profileLink) {
      profileLink.removeEventListener('click', processProfileClick);
      profileLink.addEventListener('click', processProfileClick);
    }
  }
};

const processProfileClick = (e) => {
  const parseOnclickTarget = e.target.getAttribute('onclick');
  if (parseOnclickTarget) {
    // Parse the map ID out of the onclick attribute.
    const parsedId = parseOnclickTarget.match(/show\((\d+)\)/);
    if (parsedId && parsedId.length > 1) {
      interceptMapRequest(parsedId[1]);
    }
  }
};

const addActiveTabListener = () => {
  const activeTab = document.querySelector('.treasureMapRootView-header-navigation-item.tasks');
  if (activeTab) {
    activeTab.addEventListener('click', processActiveTabClick);
  }
};

const processActiveTabClick = () => {
  interceptMapRequest(user?.quests?.QuestRelicHunter?.default_map_id);
};

const initMapper = (map) => {
  if (! (map && map.map_id && map.map_type)) {
    return;
  }

  // Depending on if it's the active map or not, process the hunters tab events.
  hunters();

  // maybe process consolation prizes.
  addConsolationPrizes();

  // if the map type is not in the groups, we're done.
  if (! mouseGroups[map.map_type]) {
    // do generic stuff here.
    if (map.is_scavenger_hunt) {
      scavenger(map);
    }
  } else {
    // do generic stuff here.
  }

  let addedSorted = mapper();
  // If the tab wasn't added, retry until it is with a 1 second delay and a max of 10 tries.
  if (! addedSorted) {
    let tries = 0;
    const interval = setInterval(() => {
      addedSorted = mapper();
      if (addedSorted || tries >= 10) {
        clearInterval(interval);
      }
      tries++;
    }, 500);
  }
};

const interceptMapRequest = (data) => {
  // If we don't have data, we're done.
  if (! data) {
    return;
  }

  let mapData = false;
  // If we get an object, we're processing the ajax request.
  if (typeof data === 'object' && data !== null) {
    // We have the ajax data, so we want to store the data in local storage
    // and actually call the mapper.
    if (! data.treasure_map || ! data.treasure_map.map_id) {
      return;
    }

    mapData = data.treasure_map;

    // Store the map data in local storage.
    setMapData(mapData.map_id, mapData);
  } else {
    // We're processing a click event, so we get the map ID, pull the data
    // from local storage, and call the mapper.
    if (! data) {
      return;
    }

    mapData = getMapData(data); // Actually map-id.
  }

  window.mhmapper = {
    mapData,
    mapModel: new hg.models.TreasureMapModel(mapData),
  };

  // Finally, call the mapper.
  initMapper(mapData);
  eventRegistry.doEvent('map_data_loaded', mapData);
};

const addListeners = () => {
  // Watch for the profile map click.
  addProfileListener();
  onPageChange(addProfileListener); // eslint-disable-line no-undef

  // Watch for the stat bar click.
  addStatBarListener();

  // Watch for the active tab click.
  addActiveTabListener();

  // Watch for map data.
  onAjaxRequest(interceptMapRequest, 'managers/ajax/users/treasuremap.php', true); // eslint-disable-line no-undef
};

const main = () => {
  eventRegistry.doEvent('mapper_start');

  addListeners();
  // sidebar();
  // scavenger();

  eventRegistry.doEvent('mapper_loaded');

  eventRegistry.addEventListener('map_goals_tab_click', addConsolationPrizes);
};

export default function betterMaps() {
  styles();
  main();
}
