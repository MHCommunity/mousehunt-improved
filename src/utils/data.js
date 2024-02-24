import { dbDelete, dbDeleteAll, dbGet, dbSet } from './db';
import { debuglog } from './debug';
import { getFlag } from './flags';

const validDataFiles = new Set([
  'minlucks',
  'wisdom',
  'effs',
  'mice-groups',
  'mice-regions',
  'items-tradable',
  'scoreboards',
  'environments',
  'upscaled-images',
  'ultimate-checkmark',
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
 * @return {Object} The cache expiration.
 */
const getCacheExpiration = async (key = null) => {
  return await cacheGet(`expiration-${key}`, false);
};

/**
 * Set the cache expiration for the given key.
 *
 * @param {string} key Key to set the expiration for.
 */
const setCacheExpiration = async (key) => {
  debuglog('utils.data', `Setting cache expiration for ${key}`);

  cacheSet(`expiration-${key}`, Date.now() + ((Math.floor(Math.random() * 7) + 7) * 24 * 60 * 60 * 1000));
};

/**
 * Check if the cache is expired for the given key.
 *
 * @param {string} key Key to check.
 *
 * @return {boolean} Whether the cache is expired.
 */
const isCacheExpired = async (key) => {
  const expiration = await getCacheExpiration(key);

  if (! expiration) {
    return true;
  }

  return expiration.date < Date.now();
};

/**
 * Fetch the data for the given key.
 *
 * @param {string} key Key to fetch.
 *
 * @return {Object} The fetched data.
 */
const fetchData = async (key) => {
  const data = await fetch(`https://api.mouse.rip/${key}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return await data.json();
};

/**
 * Get the data for the given key.
 *
 * @param {string} key Key to get the data for.
 *
 * @return {Object} The data.
 */
const getData = async (key) => {
  if (! isValidDataFile(key)) {
    debuglog('utils.data', `Cannot get data for ${key}, invalid key`);
    return false;
  }

  const isExpired = await isCacheExpired(key);
  if (! isExpired) {
    const cachedData = await cacheGet(key, false);
    if (cachedData) {
      return cachedData;
    }
  }

  debuglog('utils.data', `Fetching data for ${key} ...`);
  const data = await fetchData(key);
  debuglog('utils.data', `Fetched data for ${key}`, data);

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
  validDataFiles.forEach((file) => {
    cacheDelete(file);
  });

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

  // also delete the specified IndexedDB databases
  if (! getFlag('journal-history')) {
    await dbDeleteAll('journal-entries');
  }

  dbDelete('cache', 'expirations');
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
    'X-MH-Improved-Version': mhImprovedVersion,
    'X-MH-Improved-Platform': mhImprovedPlatform,
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
  if (getFlag('no-cache')) {
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
  if (getFlag('no-cache')) {
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
 * Set a cache value.
 *
 * @param {string} key   Key to set the value for.
 * @param {Object} value Value to set.
 */
const cacheSet = (key, value) => {
  dbSet('cache', { id: key, value });
};

/**
 * Get a cache value.
 *
 * @param {string} key          Key to get the value for.
 * @param {Object} defaultValue Default value to return if the key doesn't exist.
 *
 * @return {Object} The cache value.
 */
const cacheGet = async (key, defaultValue = false) => {
  const cached = await dbGet('cache', key);
  if (! cached) {
    return defaultValue;
  }

  return cached.value;
};

/**
 * Delete a cache value.
 *
 * @param {string} key Key to delete the value for.
 */
const cacheDelete = (key) => {
  dbDelete('cache', key);
};

export {
  getData,
  getHeaders,
  clearCaches,
  sessionSet,
  sessionGet,
  cacheSet,
  cacheGet,
  cacheDelete
};
