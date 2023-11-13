/**
 * Add custom styles to the page.
 *
 * @param {string} styles CSS to add to the page.
 */
const addUIStyles = (styles) => {
  const identifier = 'mh-improved-styles';

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

/**
 * Add custom styles specific for a location hud.
 *
 * @param {string} id     ID of the location hud.
 * @param {string} styles CSS to add to the page.
 */
const addHudStyles = (id, styles) => {
  const key = `mh-improved-styles-location-hud-${id}`;

  const existingStyles = document.getElementById(key);
  if (existingStyles) {
    return;
  }

  const style = document.createElement('style');
  style.classList.add('mh-improved-styles-location-hud');
  style.id = key;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

/**
 * Remove all location hud styles.
 */
const removeHudStyles = () => {
  const styles = document.querySelectorAll('.mh-improved-styles-location-hud');
  styles.forEach((style) => {
    style.remove();
  });
};

/**
 * Get the cached value for the given key.
 *
 * @param {string} key Key to get the cached value for.
 *
 * @return {any|boolean} Cached value or false if not found.
 */
const getCachedValue = (key) => {
  // check to see if it's in session storage first
  const isInSession = sessionStorage.getItem(key);
  if (isInSession !== null) {
    return JSON.parse(isInSession);
  }

  const localStorageContainer = localStorage.getItem(getCacheKey());
  if (! localStorageContainer) {
    return false;
  }

  const container = JSON.parse(localStorageContainer);
  if (! container[key]) {
    return false;
  }

  return container[key];
};

/**
 * Get the cache key for the current version of MH Improved, only needs to
 * be bumped when the cache needs to be cleared or the cache structure changes.
 *
 * @return {string} Cache key.
 */
const getCacheKey = () => {
  return 'mh-improved-cached-ar-v0.21.0';
};

/**
 * Get the cache key for mouse AR values.
 *
 * @see getCacheKey
 *
 * @return {string} Cache key.
 */
const getMouseCachedKey = () => {
  return 'mhct-ar-value-v0.21.0';
};

/**
 * Set the cached value for the given key.
 *
 * @param {string}  key           Key to set the cached value for.
 * @param {any}     value         Value to cache.
 * @param {boolean} saveToSession Whether to only save to session storage, not local storage.
 */
const setCachedValue = (key, value, saveToSession = false) => {
  if (saveToSession) {
    sessionStorage.setItem(key, JSON.stringify(value));
    return;
  }

  const localStorageContainer = localStorage.getItem(getCacheKey());
  let container = {};
  if (localStorageContainer) {
    container = JSON.parse(localStorageContainer);
  }

  // set the value
  container[key] = value;

  localStorage.setItem(getCacheKey(), JSON.stringify(container));
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
  let mhctjson = [];

  // check if the attraction rates are cached
  const cachedAr = getCachedValue(`${getMouseCachedKey()}-${id}-${type}`);
  if (cachedAr) {
    return cachedAr;
  }

  const isItem = 'item' === type;
  const mhctPath = isItem ? 'mhct-item' : 'mhct';

  let mhctdata = [];

  // Temp hack for halloween.
  const data = mapData() || {};
  const mapType = data?.map_type || '';
  let url = `https://api.mouse.rip/${mhctPath}/${id}`;
  if (mapType.toLowerCase().indexOf('halloween') !== -1) {
    url = `https://api.mouse.rip/${mhctPath}/${id}-hlw_22`;
  }

  mhctdata = await fetch(url);

  mhctjson = await mhctdata.json();

  if (! mhctjson || mhctjson.length === 0) {
    setCachedValue(`${getMouseCachedKey()}-${id}-${type}`, [], true);
    return [];
  }

  if (isItem) {
    // change the 'drop_ct' to 'rate'
    mhctjson.forEach((rate) => {
      // convert from a '13.53' to 1353
      rate.rate = parseInt(rate.drop_pct * 100);
      delete rate.drop_ct;
    });
  }

  setCachedValue(`${getMouseCachedKey()}-${id}-${type}`, mhctjson);

  return mhctjson;
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

  return (rate.rate / 100);
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
  return highest ? highest : false;
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
  } else if (ar >= 80) {
    arDifficulty = 'super-easy';
  } else if (ar >= 50) {
    arDifficulty = 'easy';
  } else if (ar >= 40) {
    arDifficulty = 'medium';
  } else if (ar >= 20) {
    arDifficulty = 'hard';
  } else if (ar >= 10) {
    arDifficulty = 'super-hard';
  } else if (ar >= 5) {
    arDifficulty = 'extreme';
  } else {
    arDifficulty = 'impossible';
  }

  if (ar.toString().slice(-3) === '.00') {
    ar = ar.toString().slice(0, -3);
  }

  return makeElement('div', ['mh-ui-ar', `mh-ui-ar-${arType}`, `mh-ui-ar-${arDifficulty}`], `${ar}%`);
};

/**
 * Add links to the mouse details on the map.
 */
const addArDataToMap = () => {
  const overlayClasses = document.getElementById('overlayPopup').classList;
  if (! overlayClasses.contains('treasureMapPopup')) {
    return;
  }

  const mouseIcon = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (! mouseIcon || mouseIcon.length === 0) {
    setTimeout(addArDataToMap, 500);
    return;
  }

  const mapViewClasses = document.querySelector('.treasureMapView.treasure');
  if (! mapViewClasses) {
    return;
  }

  if (mapViewClasses.classList.value.indexOf('scavenger_hunt') !== -1) {
    return;
  }

  mouseIcon.forEach((mouse) => {
    const mouseType = mouse.classList.value
      .replace('treasureMapView-goals-group-goal ', '')
      .replace(' mouse', '')
      .trim();

    mouse.addEventListener('click', () => {
      const title = document.querySelector('.treasureMapView-highlight-name');
      if (! title) {
        return;
      }

      title.classList.add('mh-ui-mouse-links-map-name');

      title.addEventListener('click', () => {
        hg.views.MouseView.show(mouseType);
      });

      title.setAttribute('data-mouse-id', mouseType);

      const div = document.createElement('div');
      div.classList.add('mh-ui-mouse-links-map');
      div.innerHTML = getLinkMarkup(title.innerText);

      const envs = document.querySelector('.treasureMapView-highlight-environments');
      if (envs) {
        envs.parentNode.insertBefore(div, envs.nextSibling);
      }
    });
  });
};

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text          Text to use for link.
 * @param {string}  href          URL to link to.
 * @param {boolean} encodeAsSpace Encode spaces as %20.
 *
 * @return {string} HTML for link.
 */
const makeLink = (text, href, encodeAsSpace = false) => {
  if (encodeAsSpace) {
    href = href.replace(/_/g, '%20');
  }

  return `<a href="${href}" target="_mouse" class="mousehuntActionButton tiny"><span>${text}</span></a>`;
};

/**
 * Show an error message appended to the given element.
 *
 * @param {string}      message  Message to show.
 * @param {HTMLElement} appendTo Element to append the error to.
 * @param {string}      classes  Classes to add to the error element.
 * @param {string}      type     Type of error to show, either 'error' or 'success'.
 */
const showErrorMessage = (message, appendTo, classes = '', type = 'error') => {
  if (! appendTo) {
    appendTo = document.querySelector('.treasureMapRootView-subTabRow.treasureMapRootView-padding');
  }

  const typeClass = `mh-ui-${type}-message`;
  const existing = document.querySelector(`.${typeClass}`);
  if (existing) {
    existing.remove();
  }

  const error = makeElement('div', [`mh-ui-${type}-message`, 'mh-ui-fade', classes], message);
  // try catch appending the error to the appendTo element
  let success = true;
  try {
    appendTo.appendChild(error);
  } catch (e) {
    success = false;
  }

  if (! success) {
    return;
  }

  setTimeout(() => {
    error.classList.add('mh-ui-fade-in');
  }, 10);

  setTimeout(() => {
    error.classList.remove('mh-ui-fade-in');
    error.classList.add('mh-ui-fade-out');
  }, 2000);

  setTimeout(() => {
    error.remove();
  }, 2500);
};

/**
 * Show a success message appended to the given element.
 *
 * @see showErrorMessage
 *
 * @param {string}      message  Message to show.
 * @param {HTMLElement} appendTo Element to append the message to.
 * @param {string}      classes  Classes to add to the message element.
 */
const showSuccessMessage = (message, appendTo, classes = '') => {
  showErrorMessage(message, appendTo, classes, 'success');
};

/**
 * Wrapper for adding a setting to the settings page.
 *
 * @param {string}  id          ID of the setting.
 * @param {string}  title       Title of the setting.
 * @param {boolean} defaultVal  Default value of the setting.
 * @param {string}  description Description of the setting.
 * @param {Object}  module      Module the setting belongs to.
 * @param {Object}  options     Additional ptions for the setting.
 */
const addMhuiSetting = (id, title, defaultVal, description, module, options = null) => {
  addSetting(
    title,
    id,
    defaultVal,
    description,
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings',
    options
  );
};

/**
 * Wrapper for getting a setting from the settings page.
 *
 * @param {string}  key          Key of the setting.
 * @param {boolean} defaultValue Default value of the setting.
 *
 * @return {boolean} Value of the setting.
 */
const getMhuiSetting = (key, defaultValue = false) => {
  return getSetting(key, defaultValue, 'mousehunt-improved-settings');
};

/**
 * Check if the given flag is enabled.
 *
 * @param {string} flag Flag to check.
 *
 * @return {boolean} Whether the flag is enabled.
 */
const getFlag = (flag) => {
  const flags = getMhuiSetting('override-flags');
  if (! flags) {
    return false;
  }

  // split the flags into an array and check if the flag is in the array
  return flags.replaceAll(' ', '').split(',').includes(flag);
};

/**
 * Helper function to add a key and value to the global object.
 *
 * @param {string} key   Key to add.
 * @param {any}    value Value to add.
 */
const addToGlobal = (key, value) => {
  // if we don't have a global object, create it
  if (! window.mhui) {
    window.mhui = {};
  }

  // add the key and value to the global object
  window.mhui[key] = value;
  app.mhui = mhui;
};

/**
 * Helper function to get a key from the global object.
 *
 * @param {string} key Key to get.
 *
 * @return {any|boolean} Value of the key or false if not found.
 */
const getGlobal = (key) => {
  if (! window.mhui) {
    return false;
  }

  return mhui[key];
};

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
 * Helper function to get the mapdata from the global object.
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
 * Helper function to get the mapmodel from the global object.
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
 * Check if we're in an iframe.
 *
 * @return {boolean} Whether we're in an iframe.
 */
const isiFrame = () => {
  return window.self !== window.top;
};

/**
 * Check to make sure we have the required global functions we need.
 *
 * @return {boolean} Whether we have the required functions.
 */
const isApp = () => {
  return typeof app !== 'undefined' &&
    typeof user !== 'undefined' &&
    typeof hg !== 'undefined' &&
    typeof eventRegistry !== 'undefined';
};

/**
 * Add a class to the body.
 *
 * @param {string} className Class to add.
 */
const addBodyClass = (className) => {
  document.body.classList.add(className);
};

/**
 * Add a body class that persists across navigation.
 *
 * @param {string} className Class to add.
 */
const persistBodyClass = (className) => {
  const addClass = () => {
    addBodyClass(className);
  };

  addClass();
  onNavigation(addClass);
  onTravel(null, { callback: () => {
    setTimeout(addClass, 500);
  } });
};

/**
 * Helper function to log a debug message.
 *
 * @param {string} message Message to log.
 * @param {any}    args    Additional arguments to log.
 */
const debug = (message, ...args) => {
  if (getFlag('debug')) {
    // eslint-disable-next-line no-console
    console.log(
      `%cMH Improved%c: ${message}`,
      'color: #90588c; font-weight: 900',
      'color: inherit; font-weight: inherit',
      ...args
    );
  }
};

/**
 * Helper function to log a debug message.
 *
 * @param {string} message Message to log.
 * @param {any}    args    Additional arguments to log.
 */
const debuglite = (message, ...args) => {
  if (getFlag('debug')) {
    // eslint-disable-next-line no-console
    console.log(
      `%c   MH Improved%c: ${message}`,
      'color: #90588c',
      'color: inherit',
      ...args
    );
  }
};

/**
 * Ping https://rh-api.mouse.rip/ to get the current location of the Relic Hunter.
 *
 * @return {Object} Relic Hunter location data.
 */
const getRelicHunterLocation = () => {
  // Cache it in session storage for 5 minutes.
  const cacheExpiry = 5 * 60 * 1000;
  const cacheKey = 'mh-improved-relic-hunter-location';
  let cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    cached = JSON.parse(cached);
  }

  // If we have a cached value and it's not expired, return it.
  if (cached && cached.expiry > new Date().getTime()) {
    return cached.data;
  }

  // Otherwise, fetch the data and cache it.
  return fetch('https://rh-api.mouse.rip/')
    .then((response) => response.json())
    .then((data) => {
      const expiry = new Date().getTime() + cacheExpiry;
      sessionStorage.setItem(cacheKey, JSON.stringify({ expiry, data }));
      return data;
    });
};

export {
  addUIStyles,
  addHudStyles,
  removeHudStyles,
  getArForMouse,
  getArText,
  getHighestArForMouse,
  getHighestArText,
  getArEl,
  addArDataToMap,
  makeLink,
  showErrorMessage,
  showSuccessMessage,
  addMhuiSetting,
  getMhuiSetting,
  getFlag,
  addToGlobal,
  getGlobal,
  mapper,
  mapData,
  mapModel,
  isiFrame,
  addBodyClass,
  persistBodyClass,
  debug,
  debuglite,
  getRelicHunterLocation,
  isApp
};
