const addMapperStyles = (styles) => {
  const identifier = 'mh-mapper-styles';

  const existingStyles = document.getElementById(identifier);
  if (existingStyles) {
    existingStyles.innerHTML += styles;
    return;
  }

  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

const getMapData = (mapId = false) => {
  if (mapId !== false) {
    const sessionMap = JSON.parse(sessionStorage.getItem(`mapper-map-${mapId}`));
    if (sessionMap) {
      return sessionMap;
    }
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
    window.mhmapper = {
      mapData: false,
      mapModel: false,
      stage: false,
      location: false,
    };
  }
};

const getArForMouse = async (mouseId) => {
  let mhctjson = [];

  // check if the attraction rates are cached
  const cachedAr = sessionStorage.getItem(`mhct-ar-${mouseId}`);
  if (cachedAr) {
    mhctjson = JSON.parse(cachedAr);
    if (! mhctjson || mhctjson.length === 0) {
      return;
    }
  } else {
    const mhctdata = await fetch(`https://api.mouse.rip/mhct/${mouseId}`);
    mhctjson = await mhctdata.json();

    if (! mhctjson || mhctjson.length === 0) {
      return;
    }

    sessionStorage.setItem(`mhct-ar-${mouseId}`, JSON.stringify(mhctjson));
  }

  return mhctjson;
};

const getArText = async (type) => {
  const rates = await getArForMouse(type);
  if (! rates) {
    return false;
  }

  // find the rate that matches window.mhctLocation.stage and window.mhctLocation.location and has the highest rate
  const rate = rates.find((r) => r.stage === window.mhctLocation.stage && r.location === window.mhctLocation.location);
  if (! rate) {
    return false;
  }

  return (rate.rate / 100).toFixed(2);
};

const getHighestArText = async (type) => {
  const rates = await getArForMouse(type);
  if (! rates) {
    return false;
  }

  // sort by rate descending
  rates.sort((a, b) => b.rate - a.rate);

  const rate = rates[0];
  if (! rate) {
    return false;
  }

  return (rate.rate / 100).toFixed(2);
};

const makeLink = (text, href, encodeAsSpace) => {
  if (encodeAsSpace) {
    href = href.replace(/_/g, '%20');
  } else {
    href = href.replace(/\s/g, '_');
  }

  href = href.replace(/\$/g, '_');

  return `<a href="${href}" target="_mouse" class="mousehuntActionButton tiny"><span>${text}</span></a>`;
};

const getLinkMarkup = (name) => {
  return makeLink('MHCT AR', `https://www.mhct.win/attractions.php?mouse=${name}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}_Mouse`) +
    makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${name}_Mouse`);
};

export {
  addMapperStyles,
  getMapData,
  setMapData,
  getLastMap,
  getArForMouse,
  getArText,
  getHighestArText,
  getLinkMarkup
};
