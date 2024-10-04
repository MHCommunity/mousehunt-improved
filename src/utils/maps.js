import { dbGet, dbSet } from './db';
import { getData, getHeaders, sessionGet, sessionSet } from './data';

import { getCurrentLocation } from './location';
import { getGlobal } from './global';
import { makeElement } from './elements';

/**
 * Helper function to get the mapper object from the global object.
 *
 * @param {string} key Key to get.
 *
 * @return {Object} Mapper object.
 */
const mapper = (key = false) => {
  if (key) {
    const mapperData = getGlobal('mapper');
    if (! mapperData || ! mapperData[key]) {
      return false;
    }

    return mapperData[key];
  }

  return getGlobal('mapper');
};

/**
 * Helper function to get the map data from the global object.
 *
 * @return {Object} Map data.
 */
const mapData = () => {
  const m = mapper();
  if (! m) {
    return {};
  }

  return m.mapData;
};

/**
 * Helper function to get the map model from the global object.
 *
 * @return {Object} Map model.
 */
const mapModel = () => {
  const m = mapper();
  if (! m) {
    return {};
  }

  return m.mapModel;
};

/**
 * Get the cached map data for the given map ID.
 *
 * @param {string|boolean} mapId  Map ID to get the data for, or false to get the last map.
 * @param {boolean}        strict Whether to only get the data from the cache, not the last map.
 *
 * @return {Object|boolean} Map data or false if not found.
 */
const getMapData = (mapId = false, strict = false) => {
  if (mapId !== false) {
    const sessionMap = sessionGet(`mh-improved-map-cache-${mapId}`);
    if (sessionMap) {
      return sessionMap;
    }
  }

  if (strict) {
    return false;
  }

  const localStorageMap = sessionGet('map-cache-last-map');
  if (localStorageMap) {
    return localStorageMap;
  }

  return false;
};

/**
 * Set the map data for the given map ID.
 *
 * @param {string} mapId      Map ID to set the data for.
 * @param {Object} theMapData Map data to set.
 */
const setMapData = (mapId, theMapData) => {
  sessionSet(`mh-improved-map-cache-${mapId}`, theMapData);
  sessionSet('map-cache-last-map', theMapData);
};

/**
 * Get the last maptain.
 *
 * @return {string} Last maptain.
 */
const getLastMaptain = () => {
  return sessionGet('last-maptain');
};

/**
 * Set the last maptain.
 *
 * @param {string} id ID to set as the last maptain.
 */
const setLastMaptain = (id) => {
  sessionSet('last-maptain', id);
};

/**
 * Cache the finished map.
 */
const cacheFinishedMap = async () => {
  const completedMap = user.quests.QuestRelicHunter.maps.find((map) => map.is_complete);
  if (! completedMap?.map_id) {
    return;
  }

  const data = getMapData(completedMap.map_id);
  if (! data) {
    return;
  }

  const maptain = data.hunters.find((hunter) => hunter.captain);

  setLastMaptain(maptain.user_id || '');
};

/**
 * Show the travel confirmation dialog.
 *
 * @param {Object} environment Environment to travel to.
 * @param {Object} theMapModel Map model.
 */
const showTravelConfirmation = (environment, theMapModel) => {
  if (! environment?.id || ! environment?.type) {
    return;
  }

  const environmentData = theMapModel.getEnvironmentById(environment.id);
  const environmentGoals = theMapModel.getGoalsByEnvironment(environment.id);
  const noun = environmentData.num_missing_goals === 1 ? 'mouse' : 'mice';

  showTravelConfirmationForMice({
    title: `Travel to ${environmentData.name}?`,
    description: `This area has ${environmentData.num_missing_goals} missing ${noun}.`,
    environment: environment.type,
    templateData: {
      environment: environmentData,
      goals: environmentGoals
    }
  });
};

/**
 * Show the travel confirmation dialog for mice.
 *
 * @param {Object} options              Options for the dialog.
 * @param {string} options.title        Title for the dialog.
 * @param {string} options.description  Description for the dialog.
 * @param {Object} options.environment  Environment to travel to.
 * @param {Object} options.templateData Template data for the dialog.
 */
const showTravelConfirmationForMice = ({ title, description, environment, templateData }) => {
  const dialog = new hg.views.TreasureMapDialogView();
  dialog.setTitle(title);
  dialog.setDescription(description);

  dialog.setContent(hg.utils.TemplateUtil.renderFromFile('TreasureMapDialogView', 'travel', templateData));
  dialog.setCssClass('confirm');
  dialog.setContinueAction('Travel', () => {
    app.pages.TravelPage.travel(environment);
    setTimeout(() => {
      jsDialog().hide();
    }, 250);
  });

  hg.controllers.TreasureMapController.showDialog(dialog);
};

/**
 * Show the travel confirmation dialog, but just for the environment.
 *
 * @param {Object} environment Environment to travel to.
 */
const showTravelConfirmationNoDetails = async (environment) => {
  const templateData = {
    environment: {
      name: environment.name || environment.id || '',
      id: environment.id,
      type: environment.id,
      thumb: environment.image || environment.thumb,
      header: environment.header || environment.image || environment.thumb,
      goals: environment.goals || [],
      num_completed_goals: 0,
      num_total_goals: 0,
      hunters: [],
      is_current_environment: getCurrentLocation() === environment.id,
      can_travel: true,
      num_missing_goals: 0,
    },
    goals: []
  };

  showTravelConfirmationForMice({
    title: `Travel to ${environment.name}?`,
    description: '',
    environment: environment.type,
    templateData
  });
};

/**
 * Add the MHCT data to the given element.
 *
 * @param {Object} mouse    Mouse to get the data for.
 * @param {Object} appendTo Element to append the data to.
 * @param {string} type     Type of data to get, either 'mouse' or 'item'.
 */
const addMHCTData = async (mouse, appendTo, type = 'mouse') => {
  const existingMhct = appendTo.querySelector(`#mhct-${mouse.unique_id}-${type}`);
  if (existingMhct) {
    return;
  }

  const mhctJson = await getArForMouse(mouse.unique_id, type);

  const mhctDiv = makeElement('div', 'mhct-data');
  mhctDiv.id = `mhct-${mouse.unique_id}-${type}`;

  const header = makeElement('div', 'mhct-title');
  makeElement('span', 'mhct-title-text', 'item' === type ? 'Drop Rates' : 'Attraction Rates', header);
  const mhctLink = makeElement('a', 'mhct-link', 'View on MHCT →');
  mhctLink.target = '_mhct';

  if (! mouse.name) {
    const nameEl = document.querySelector('.treasureMapView-highlight-name');
    mouse.name = nameEl ? nameEl.innerText : mouse.unique_id;
  }

  mhctLink.href = `https://api.mouse.rip/mhct-redirect${'item' === type ? '-item' : ''}/${mouse.unique_id}`;

  header.append(mhctLink);
  mhctDiv.append(header);

  if (! mhctJson.slice) {
    return;
  }

  const environments = await getData('environments');

  const amountOfLocationsToShow = 5; // TODO: maybe modify this for some mice or make it an option?
  mhctJson.slice(0, amountOfLocationsToShow).forEach((mhct) => {
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

    mhctRow.append(location);

    makeElement('div', 'mhct-bait', mhct.cheese, mhctRow);

    const mhctRate = (Math.round(('item' === type ? mhct.drop_pct : mhct.rate / 100) * 100) / 100).toFixed(1);
    makeElement('div', 'mhct-rate', `${mhctRate}%`, mhctRow);

    mhctRow.addEventListener('click', () => {
      // if we're in the right location, then equip the right cheese, otherwise show the travel dialog)
      if (environment && environment.id === getCurrentLocation() && app?.pages?.CampPage?.showTrapSelector) {
        app.pages.CampPage.showTrapSelector('bait');
        jsDialog().hide();
        return;
      }

      const travelEnvironment = mapper('mapData').environments.find((env) => {
        return env.type === environment.id;
      });

      showTravelConfirmation(travelEnvironment, mapModel());
    });

    mhctDiv.append(mhctRow);
  });

  // if the rows were empty, then add a message
  if (0 === mhctJson.length) {
    const mhctRow = makeElement('div', 'mhct-row');
    makeElement('div', 'mhct-no-data', 'No data available', mhctRow);
    mhctDiv.append(mhctRow);
  }

  appendTo.append(mhctDiv);
};

/**
 * Get the cached value for the given key.
 *
 * @param {string} key Key to get the cached value for.
 *
 * @return {any|boolean} Cached value or false if not found.
 */
const getCachedValue = async (key) => {
  const value = await dbGet('ar-cache', key);
  if (! value?.data?.value) {
    return null;
  }

  return value.data.value;
};

/**
 * Set the cached value for the given key.
 *
 * @param {string} key   Key to set the cached value for.
 * @param {any}    value Value to cache.
 */
const setCachedValue = async (key, value) => {
  await dbSet('ar-cache', { id: key, value });
};

/**
 * Get the attraction rate element for the given mouse or item.
 *
 * @param {string} id   ID to get the attraction rate for, either mouse or item ID.
 * @param {string} type Type of attraction rate to get, either 'mouse' or 'item'.
 *
 * @return {HTMLElement} Attraction rate element.
 */
const getArEl = async (id, type = 'mouse') => {
  let ar = await getArText(id, type);
  let arType = 'location';
  if (! ar) {
    ar = await getHighestArText(id, type);
    if (! ar || ar.length === 0) {
      return makeElement('div', ['mh-ui-ar', 'mh-ui-no-ar'], '?');
    }

    arType = 'highest';
  }

  let arDifficulty = 'easy';
  if (ar >= 99) {
    arDifficulty = 'guaranteed';
  } else if (ar >= 59) {
    arDifficulty = 'super-easy';
  } else if (ar >= 49) {
    arDifficulty = 'easy';
  } else if (ar >= 39) {
    arDifficulty = 'medium';
  } else if (ar >= 27) {
    arDifficulty = 'hard';
  } else if (ar >= 14) {
    arDifficulty = 'kinda-hard';
  } else if (ar >= 5) {
    arDifficulty = 'super-hard';
  } else if (ar >= 2) {
    arDifficulty = 'extreme';
  } else {
    arDifficulty = 'impossible';
  }

  if (ar.toString().slice(-3) === '.00') {
    ar = ar.toString().slice(0, -3);
  }

  const arEl = makeElement('div', ['mh-ui-ar', `mh-ui-ar-${arType}`, `mh-ui-ar-${arDifficulty}`], `${ar}%`);

  arEl.title = `Attraction rate: ${ar}%`;
  arEl.setAttribute('data-ar', ar);

  return arEl;
};

/**
 * Get the highest attraction rate text for the given mouse or item.
 *
 * @param {string} id   ID to get the attraction rate for, either mouse or item ID.
 * @param {string} type Type of attraction rate to get, either 'mouse' or 'item'.
 *
 * @return {string|boolean} Attraction rate text or false if not found.
 */
const getHighestArText = async (id, type = 'mouse') => {
  const highest = await getHighestArForMouse(id, type);
  return highest ?? false;
};

/**
 * Get the attraction rate for the given mouse or item.
 *
 * @param {string} id   ID to get the attraction rate for, either mouse or item ID.
 * @param {string} type Type of attraction rate to get, either 'mouse' or 'item'.
 *
 * @return {Array|boolean} Array of attraction rates or false if not found.
 */
const getArForMouse = async (id, type = 'mouse') => {
  let mhctJson = [];

  const cacheKey = `${type}-${id}`;

  // check if the attraction rates are cached
  const cachedAr = await getCachedValue(cacheKey);
  if (cachedAr) {
    return cachedAr;
  }

  const isItem = 'item' === type;
  const mhctPath = isItem ? 'mhct-item' : 'mhct';

  let mhctData = [];

  // Temp hack for halloween.
  const data = mapData() || {};
  const mapType = data?.map_type || '';
  let url = `https://api.mouse.rip/${mhctPath}/${id}`;
  if (mapType.toLowerCase().includes('halloween')) {
    url = `https://api.mouse.rip/${mhctPath}/${id}-hlw_22`;
  }

  // No sense in fetching the data for the m400 mouse.
  if (! isItem && (id === 'm400' || id == 547)) { // eslint-disable-line eqeqeq
    return [];
  }

  try {
    mhctData = await fetch(url, { headers: getHeaders() });
  } catch (error) {
    console.error('Error fetching MHCT data:', error); // eslint-disable-line no-console
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      mhctData = await fetch(url, { headers: getHeaders() });
    } catch (errorRetry) { // eslint-disable-line unicorn/catch-error-name
      console.error('Error fetching MHCT data:', errorRetry); // eslint-disable-line no-console
      return [];
    }
  }

  if (! mhctData.ok) {
    return [];
  }

  mhctJson = await mhctData.json();

  if (! mhctJson || mhctJson.length === 0) {
    return [];
  }

  if (isItem) {
    // change the 'drop_ct' to 'rate'
    for (const rate of mhctJson) {
      // convert from a '13.53' to 1353
      rate.rate = Number.parseInt(rate.drop_pct * 100);
      delete rate.drop_ct;
    }
  }

  if (mhctJson.error) {
    return [];
  }

  // if any of the rates are 0, then remove them
  // if any of the rates are 9999 then set them to 100
  mhctJson = mhctJson.filter((rate) => {
    if (rate.rate === 0) {
      return false;
    }

    if (rate.rate === 9999) {
      rate.rate = 10000;
    }

    return true;
  });

  await setCachedValue(cacheKey, mhctJson);

  return mhctJson;
};

/**
 * Get the attraction rate text for the given mouse or item.
 *
 * @param {string} id   ID to get the attraction rate for, either mouse or item ID.
 * @param {string} type Type of attraction rate to get, either 'mouse' or 'item'.
 *
 * @return {string|boolean} Attraction rate text or false if not found.
 */
const getArText = async (id, type = 'mouse') => {
  const rates = await getArForMouse(id, type);
  if (! rates || rates.length === 0) {
    return false;
  }

  const rate = rates[0];
  if (! rate) {
    return false;
  }

  return (rate.rate / 100).toFixed(2);
};

/**
 * Get the highest attraction rate for the given mouse or item.
 *
 * @param {string} id   ID to get the attraction rate for, either mouse or item ID.
 * @param {string} type Type of attraction rate to get, either 'mouse' or 'item'.
 *
 * @return {string|boolean} Attraction rate text or false if not found.
 */
const getHighestArForMouse = async (id, type = 'mouse') => {
  const rates = await getArForMouse(id, type);
  if (! rates || rates.length === 0) {
    return 0;
  }

  // make sure the rates aren't an empty object
  if (Object.keys(rates).length === 0 && rates.constructor === Object) {
    return 0;
  }

  // make sure we can sort the rates
  if (! rates.sort) {
    return 0;
  }

  // sort by rate descending
  rates.sort((a, b) => b.rate - a.rate);

  const rate = rates[0];
  if (! rate) {
    return 0;
  }

  return rate.rate / 100;
};

/**
 * Get the best AR location for the given mouse.
 *
 * @param {Object} mouse Mouse to get the location for.
 * @param {string} type  Type of mouse, either 'mouse' or 'item'.
 *
 * @return {Object|boolean} Location object or false if not found.
 */
const getLocationForMouse = async (mouse, type = 'mouse') => {
  // get the AR for the mouse and then grab the location property from the highest AR.
  // compare that to the name string of the environments and return the environment ID.
  const environments = await getData('environments');
  const rates = await getArForMouse(mouse, type);

  if (! rates || rates.length === 0) {
    return false;
  }

  const rate = rates[0];

  if (! rate) {
    return false;
  }

  const originalName = rate.location;

  const twistedMap = {
    'Twisted Garden': 'Living Garden',
    'Sand Crypts': 'Sand Dunes',
    'Cursed City': 'Lost City',
  };

  if (twistedMap[rate.location]) {
    rate.location = twistedMap[rate.location];
  }

  const environment = environments.find((env) => {
    return env.name === rate.location;
  });

  if (! environment) {
    return false;
  }

  environment.name = originalName;

  return environment;
};

export {
  mapper,
  mapData,
  mapModel,
  getMapData,
  setMapData,
  addMHCTData,
  showTravelConfirmation,
  getArEl,
  getArForMouse,
  getHighestArForMouse,
  getLastMaptain,
  setLastMaptain,
  cacheFinishedMap,
  getLocationForMouse,
  showTravelConfirmationNoDetails
};
