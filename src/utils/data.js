import { dbDeleteAll } from './db';
import { debuglog } from './debug';
import { getFlag } from './flags';

/**
 * Check if the given file is a valid data file available from the API.
 *
 * @param {string} file File to check.
 *
 * @return {boolean} Whether the file is valid.
 */
const isValidDataFile = (file) => {
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
  ]);

  return validDataFiles.has(file);
};

/**
 * Get a prefixed cache key.
 *
 * @param {string} key Key to prefix.
 *
 * @return {string} The prefixed key.
 */
const getCacheKey = (key) => {
  return `mh-improved-cached-data--${key}`;
};

/**
 * Get the cache expiration key.
 *
 * @return {string} The cache expiration key.
 */
const getCacheExpirationKey = () => {
  return 'mh-improved-cached-data-expiration';
};

/**
 * Get the cache expirations.
 *
 * @return {Object} The cache expirations.
 */
const getCacheExpirations = () => {
  return JSON.parse(localStorage.getItem(getCacheExpirationKey())) || {};
};

/**
 * Get the cache expiration for the given key.
 *
 * @param {string} key Key to get the expiration for.
 *
 * @return {Object} The cache expiration.
 */
const getCacheExpiration = (key) => {
  const allCacheExpirations = getCacheExpirations();

  return allCacheExpirations[key] || {
    date: 0,
    version: 0,
  };
};

/**
 * Set the cache expiration for the given key.
 *
 * @param {string} key Key to set the expiration for.
 */
const setCacheExpiration = (key) => {
  const allCacheExpirations = getCacheExpirations();

  debuglog('utils.data', `Setting cache expiration for ${key}`);

  allCacheExpirations[key] = {
    date: Date.now() + ((Math.floor(Math.random() * 7) + 7) * 24 * 60 * 60 * 1000),
    version: mhImprovedVersion,
  };

  debuglog('utils.data', `Setting cache expiration for ${key} to ${allCacheExpirations[key].date}`);

  localStorage.setItem(getCacheExpirationKey(), JSON.stringify(allCacheExpirations));
};

/**
 * Check if the cache is expired for the given key.
 *
 * @param {string} key Key to check.
 *
 * @return {boolean} Whether the cache is expired.
 */
const isCacheExpired = (key) => {
  const expiration = getCacheExpiration(key);

  if (! expiration || ! expiration?.date || ! expiration?.version) {
    return true;
  }

  if (expiration.version !== mhImprovedVersion) {
    return true;
  }

  return expiration.date < Date.now();
};

/**
 * Get the cached data for the given key.
 *
 * @param {string} key Key to get the cached data for.
 *
 * @return {Object} The cached data.
 */
const getCachedData = (key) => {
  const isExpired = isCacheExpired(key);

  if (isExpired) {
    return false;
  }

  const fromStorage = localStorage.getItem(getCacheKey(key));

  if (! fromStorage) {
    return false;
  }

  return JSON.parse(fromStorage);
};

/**
 * Set the cached data for the given key.
 *
 * @param {string} key  Key to set the cached data for.
 * @param {Object} data Data to cache.
 */
const setCachedData = (key, data) => {
  const cacheKey = getCacheKey(key);

  localStorage.setItem(cacheKey, JSON.stringify(data));
  setCacheExpiration(key);
};

/**
 * Fetch and cache the data for the given key.
 *
 * @param {string} key Key to fetch and cache the data for.
 *
 * @return {Object} The fetched and cached data.
 */
const fetchAndCacheData = async (key) => {
  const data = await fetch(`https://api.mouse.rip/${key}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const json = await data.json();

  setCachedData(key, json);

  return json;
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

  const cachedData = getCachedData(key);
  if (cachedData) {
    return cachedData;
  }

  debuglog('utils.data', `Fetching data for ${key} ...`);
  const data = await fetchAndCacheData(key);

  debuglog('utils.data', `Fetched data for ${key}`, data);
  return data;
};

/**
 * Clear all the caches.
 */
const clearCaches = async () => {
  const allCacheExpirations = getCacheExpirations();

  for (const key of Object.keys(allCacheExpirations)) {
    localStorage.removeItem(getCacheKey(key));
  }

  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith('mh-improved')) {
      sessionStorage.removeItem(key);
    }
  }

  // also delete the specified IndexedDB databases
  await dbDeleteAll('journal-entries');

  localStorage.removeItem(getCacheExpirationKey());
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
      // Delete all the mh-improved keys.
      for (const skey of Object.keys(sessionStorage)) {
        if (skey.startsWith('mh-improved')) {
          sessionStorage.removeItem(skey);
        }
      }

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

export {
  getData,
  getHeaders,
  clearCaches,
  sessionSet,
  sessionGet
};
