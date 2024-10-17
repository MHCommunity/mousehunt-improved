import { dbDelete, dbGet, dbSet } from './db';
import { debuglog } from './debug';
import { getSetting } from './settings';

const validDataFiles = new Set([
  'community-map-data',
  'effs',
  'environments-events',
  'environments',
  'item-thumbnails',
  'items-tradable',
  'm400-locations',
  'marketplace-hidden-items',
  'mice-groups',
  'mice-regions',
  'mice-thumbnails',
  'minlucks',
  'relic-hunter-hints',
  'scoreboards',
  'scrolls-to-maps',
  'ultimate-checkmark',
  'upscaled-images',
  'wisdom',
  'items',
]);

/**
 * Check if the given file is a valid data file available from the API.
 *
 * @param {string} file File to check.
 *
 * @return {boolean} Whether the file is valid.
 */
const isValidDataFile = (file) => {
  return validDataFiles.has(file);
};

/**
 * Get the cache expiration for the given key.
 *
 * @param {string} key Key to get the expiration for.
 *
 * @return {Promise<number>} The cache expiration in milliseconds since epoch.
 */
const getCacheExpiration = async (key = null) => {
  return await cacheGet(`expiration-${key}`, 0);
};

/**
 * Set the cache expiration for the given key.
 *
 * @param {string} key Key to set the expiration for.
 */
const setCacheExpiration = async (key) => {
  debuglog('utils-data', `Setting cache expiration for ${key}`);

  cacheSet(`expiration-${key}`, Date.now() + ((Math.floor(Math.random() * 7) + 7) * 24 * 60 * 60 * 1000));
};

/**
 * Check if the cache is expired for the given key.
 *
 * @param {string} key Key to check.
 *
 * @return {Promise<boolean>} Whether the cache is expired.
 */
const isCacheExpired = async (key) => {
  const expiration = await getCacheExpiration(key);

  if (! expiration) {
    return true;
  }

  return expiration < Date.now();
};

/**
 * Fetch the data for the given key.
 *
 * @param {string} key     Key to fetch.
 * @param {number} retries Number of retries.
 *
 * @return {Promise<Object>} The fetched data.
 */
const fetchData = async (key, retries = 0) => {
  try {
    const data = await fetch(`https://api.mouse.rip/${key}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return await data.json();
  } catch (error) {
    console.error(`Error fetching data for ${key}:`, error); // eslint-disable-line no-console

    if (retries >= 3) {
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 500 * retries));

    return fetchData(key, retries + 1);
  }
};

/**
 * Get the data for the given key.
 *
 * @param {string}  key   Key to get the data for.
 * @param {boolean} force Whether to force fetching the data.
 *
 * @return {Object} The data.
 */
const getData = async (key, force = false) => {
  if (! isValidDataFile(key)) {
    debuglog('utils-data', `Cannot get data for ${key}, invalid key`);
    return false;
  }

  const isExpired = await isCacheExpired(key);
  if (! isExpired && ! force) {
    const cachedData = await dataCacheGet(key, false);
    if (cachedData) {
      return cachedData;
    }
  }

  debuglog('utils-data', `Fetching data for ${key}…`);
  const data = await fetchData(key);
  debuglog('utils-data', `Fetched data for ${key}`, data);

  if (data) {
    cacheSet(key, data);
    setCacheExpiration(key);
  }

  return data;
};

/**
 * Clear all the caches.
 */
const clearCaches = async () => {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('mh-improved-cache')) {
      localStorage.removeItem(key);
    }
  }

  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith('mh-improved')) {
      sessionStorage.removeItem(key);
    }
  }

  await dbDelete('cache', 'expirations');

  await updateCaches();
};

/**
 * Prime the caches.
 */
const updateCaches = async () => {
  for (const file of validDataFiles) {
    await getData(file, true);
  }
};

/**
 * Get the headers for the fetch request.
 *
 * @return {Object} The headers.
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-MH-Improved': 'true',
    'X-MH-Improved-Version': mhImprovedVersion || 'unknown',
    'X-MH-Improved-Platform': mhImprovedPlatform || 'unknown',
  };
};

/**
 * Set a session value.
 *
 * @param {string}  key   Key to set the value for.
 * @param {Object}  value Value to set.
 * @param {boolean} retry Whether to retry setting the value.
 */
const sessionSet = (key, value, retry = false) => {
  if (getSetting('debug.no-cache')) {
    return;
  }

  key = `mh-improved-${key}`;
  const stringified = JSON.stringify(value);

  try {
    sessionStorage.setItem(key, stringified);
  } catch (error) {
    if ('QuotaExceededError' === error.name && ! retry) {
      clearCaches();

      // Try again.
      sessionSet(key, value, true);
    }
  }
};

/**
 * Get a session value.
 *
 * @param {string} key          Key to get the value for.
 * @param {Object} defaultValue Default value to return if the key doesn't exist.
 *
 * @return {Object} The session value.
 */
const sessionGet = (key, defaultValue = false) => {
  if (getSetting('debug.no-cache')) {
    return defaultValue;
  }

  key = `mh-improved-${key}`;
  const value = sessionStorage.getItem(key);
  if (! value) {
    return defaultValue;
  }

  return JSON.parse(value);
};

/**
 * Delete a session value.
 *
 * @param {string} key Key to delete the value for.
 */
const sessionDelete = (key) => {
  key = `mh-improved-${key}`;
  sessionStorage.removeItem(key);
};

/**
 * Delete multiple session values with a given prefix.
 *
 * @param {string} prefix Prefix to match.
 */
const sessionsDelete = (prefix) => {
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(prefix)) {
      sessionStorage.removeItem(key);
    }
  }
};

/**
 * Set a cache value.
 *
 * @param {string} key   Key to set the value for.
 * @param {Object} value Value to set.
 */
const cacheSet = (key, value) => {
  dbSet('cache', { id: key, value });
};

/**
 * Set a cache value.
 *
 * @param {string} key   Key to set the value for.
 * @param {Object} value Value to set.
 */
const cacheSetAsync = async (key, value) => {
  await dbSet('cache', { id: key, value });
};

/**
 * Helper function to get a cache value.
 *
 * @template T
 * @param {string} key          Key to get the value for.
 * @param {T}      defaultValue Default value to return if the key doesn't exist.
 *
 * @return {Promise<T>} The cache value.
 */
const cacheGetHelper = async (key, defaultValue = false) => {
  const cached = await dbGet('cache', key);
  if (! cached?.data?.value) {
    return defaultValue;
  }

  return cached.data.value;
};

/**
 * Get a cache value.
 *
 * @template T
 * @param {string} key          Key to get the value for.
 * @param {T}      defaultValue Default value to return if the key doesn't exist.
 *
 * @return {Promise<T>} The cache value.
 */
const cacheGet = async (key, defaultValue = false) => {
  return await cacheGetHelper(key, defaultValue, 'cache');
};

/**
 * Get a data cache value.
 *
 * @template T
 * @param {string} key          Key to get the value for.
 * @param {T}      defaultValue Default value to return if the key doesn't exist.
 *
 * @return {Promise<T>} The cache value.
 */
const dataCacheGet = async (key, defaultValue = false) => {
  return await cacheGetHelper(key, defaultValue, 'data');
};

/**
 * Delete a cache value.
 *
 * @param {string} key Key to delete the value for.
 */
const cacheDelete = (key) => {
  dbDelete('cache', key);
};

/**
 * Set a data value.
 *
 * @param {string} key   Key to set the value for.
 * @param {Object} value Value to set.
 */
const dataSet = (key, value) => {
  dbSet('data', { id: key, value });
};

/**
 * Get a data value.
 *
 * @param {string} key          Key to get the value for.
 * @param {Object} defaultValue Default value to return if the key doesn't exist.
 *
 * @return {Promise<Object>} The data value.
 */
const dataGet = async (key, defaultValue = false) => {
  const cached = await dbGet('data', key);
  if (! cached?.data?.value) {
    return defaultValue;
  }

  return cached.data.value;
};

export {
  dataSet,
  dataGet,
  cacheDelete,
  cacheGet,
  cacheSet,
  cacheSetAsync,
  clearCaches,
  getData,
  getHeaders,
  updateCaches,
  sessionGet,
  sessionSet,
  sessionDelete,
  sessionsDelete
};
