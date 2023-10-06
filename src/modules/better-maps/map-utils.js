import environments from '../../data/environments.json';

import { getArForMouse } from '../utils';

const getMapData = (mapId = false, strict = false) => {
  if (mapId !== false) {
    const sessionMap = JSON.parse(sessionStorage.getItem(`mapper-map-${mapId}`));
    if (sessionMap) {
      return sessionMap;
    }
  }

  if (strict) {
    return false;
  }

  const localStorageMap = JSON.parse(sessionStorage.getItem('mapper-latest'));
  if (localStorageMap) {
    return localStorageMap;
  }

  return false;
};

const setMapData = (mapId, mapData) => {
  sessionStorage.setItem(`mapper-map-${mapId}`, JSON.stringify(mapData));
  sessionStorage.setItem('mapper-latest', JSON.stringify(mapData));
};

const getLastMap = () => {
  const lastMap = getMapData();
  if (lastMap) {
    interceptMapRequest(lastMap);
  } else {
    window.mhui = {
      mapData: false,
      mapModel: false,
      stage: false,
      location: false,
    };
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
        .replace(/[^a-z-]/g, '')
        .replace('--', '-')
        .replace('goalssearch', 'goals');
      block.classList.add(`mh-ui-${blockType}-title`);
      prevBlockType = blockType;
    } else {
      block.classList.add(`mh-ui-${prevBlockType}-block`);
    }
  });
};

const addMHCTData = async (mouse, appendTo, type = 'mouse') => {
  const existingMhct = appendTo.querySelector(`#mhct-${mouse.unique_id}`);
  if (existingMhct) {
    return;
  }

  const mhctjson = await getArForMouse(mouse.unique_id, type);

  const mhctDiv = makeElement('div', 'mhct-data');
  mhctDiv.id = `mhct-${mouse.unique_id}-${type}`;

  const amountOfLocationsToShow = 5; // TODO: maybe modify this for some mice or make it an option?
  mhctjson.slice(0, amountOfLocationsToShow).forEach((mhct) => {
    const mhctRow = makeElement('div', 'mhct-row');
    const location = makeElement('div', 'mhct-location');

    makeElement('span', 'mhct-location-text', mhct.location, location);

    if (mhct.stage) {
      makeElement('span', 'mhct-stage', mhct.stage, location);
    }

    const environment = environments.find((env) => {
      return env.name === mhct.location;
    });

    if (! environment) {
      mhctRow.classList.add('mhct-row-no-env');
    }

    mhctRow.appendChild(location);

    makeElement('div', 'mhct-bait', mhct.cheese, mhctRow);

    const mhctRate = parseInt('item' === type ? mhct.drop_pct : mhct.rate / 100, 10).toFixed(1);
    makeElement('div', 'mhct-rate', `${mhctRate}%`, mhctRow);

    mhctRow.addEventListener('click', () => {
      // if we're in the right location, then equip the right cheese, otherwise show the travel dialog)
      if (environment.id === getCurrentLocation()) {
        app.pages.CampPage.toggleItemBrowser('bait');
        jsDialog().hide();
        return;
      }

      const travelEnvironment = window.mhui.mapper?.mapData.environments.find((env) => {
        return env.type === environment.id;
      });

      showTravelConfirmation(travelEnvironment, window.mhui.mapper?.mapModel);
    });

    mhctDiv.appendChild(mhctRow);
  });

  appendTo.appendChild(mhctDiv);
};

export {
  addBlockClasses,
  getMapData,
  setMapData,
  getLastMap,
  addMHCTData
};
