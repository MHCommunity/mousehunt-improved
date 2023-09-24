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

export {
  addBlockClasses,
  getMapData,
  setMapData,
  getLastMap
};
