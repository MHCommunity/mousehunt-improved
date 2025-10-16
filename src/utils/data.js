import { dbDelete, dbDeleteAll, dbGet, dbSet } from './db';
import { debuglog } from './debug';
import { getSetting } from './settings';

const validDataFiles = new Set([
  'community-map-data',
  'effs',
  'environments-events',
  'environments',
  'item-thumbnails',
  'items-tradable',
  'items',
  'library-assignments',
  'm400-locations',
  'marketplace-hidden-items',
  'mhct-convertibles',
  'mice-groups',
  'mice-regions',
  'mice-thumbnails',
  'mice',
  'minlucks',
  'relic-hunter-hints',
  'scoreboards',
  'scrolls-to-maps',
  'titles',
  'ultimate-checkmark',
  'upscaled-images',
  'wisdom',
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
  const expiration = await dbGet('cache', `expiration-${key}`);
  if (! expiration || ! expiration.data || ! expiration.data.value) {
    return null;
  }

  return expiration.data.value;
};

/**
 * Set the cache expiration for the given key.
 *
 * @param {string} key         Key to set the expiration for.
 * @param {number} [time=null] Time in milliseconds since epoch. If null, defaults to 7 days from now.
 *
 * @return {Promise<void>} Resolves when the expiration is set.
 */
const cacheSetExpiration = async (key, time = null) => {
  if (time) {
    return await dbSet('cache', { id: `expiration-${key}`, value: Date.now() + time });
  }

  const expirationTime = Date.now() + ((Math.floor(Math.random() * 7) + 7) * 24 * 60 * 60 * 1000);
  return await dbSet('cache', { id: `expiration-${key}`, value: expirationTime });
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
    const data = await fetch(`https://api.mouse.rip/${key}?v=${mhImprovedVersion || 'unknown'}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return await data.json();
  } catch (error) {
    console.error(`Error fetching data for ${key}:`, error); // eslint-disable-line no-console

    if (retries >= 3) {
      return {};
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
    console.error(`Invalid data file requested: ${key}`); // eslint-disable-line no-console
    return {};
  }

  if (! force) {
    const cachedData = await cacheGet(key, false);
    if (cachedData) {
      return cachedData;
    }
  }

  debuglog('utils-data', `Fetching data for ${key}…`);
  const data = await fetchData(key);
  debuglog('utils-data', `Fetched data for ${key}`, data);

  if (data) {
    await cacheSet(key, data);
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

  // delete all the entries in the IndexedDB databases
  await dbDeleteAll('cache');

  // Clear all cache entries
  for (const file of validDataFiles) {
    await dbDelete('cache', file);
    await dbDelete('cache', `expiration-${file}`);
  }

  // Clear data cache
  for (const file of validDataFiles) {
    await dbDelete('data', file);
  }

  await updateCaches();
};

/**
 * Prime the caches.
 */
const updateCaches = async () => {
  for (const file of validDataFiles) {
    await getData(file, true);

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  // Clear CRE caches to force refresh.
  cacheDelete('cre-location');
  cacheDelete('cre-stats');
  cacheDelete('cre-effectiveness');
};

/**
 * Mark all caches as expired.
 */
const markCachesAsExpired = async () => {
  for (const file of validDataFiles) {
    await cacheSetExpiration(file, Date.now() - 1000);
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
 * @param {string} key               Key to set the value for.
 * @param {Object} value             Value to set.
 * @param {number} [expiration=null] Expiration time in milliseconds since epoch. If null, defaults to 7 days.
 *
 * @return {Promise<Object>} The value that was set.
 */
const cacheSet = async (key, value, expiration = null) => {
  await Promise.all([
    dbSet('cache', { id: key, value }),
    cacheSetExpiration(key, expiration),
  ]);

  return value;
};

/**
 * Set a cache value without expiration.
 *
 * @param {string} key   Key to set the value for.
 * @param {Object} value Value to set.
 *
 * @return {Promise<Object>} The value that was set.
 */
const cacheSetNoExpiration = async (key, value) => {
  return await dbSet('cache', { id: key, value });
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
  // Check if cache is expired first
  const isExpired = await isCacheExpired(key);

  if (isExpired) {
    // Delete expired cache entry
    await cacheDelete(key);
    return defaultValue;
  }

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
  return await cacheGetHelper(key, defaultValue);
};

/**
 * Get a cache value without checking expiration.
 *
 * @param {string} key          Key to get the value for.
 * @param {Object} defaultValue Default value to return if the key doesn't exist.
 *
 * @return {Promise<Object>} The cache value.
 */
const cacheGetNoExpiration = async (key, defaultValue = false) => {
  const cached = await dbGet('cache', key);
  if (! cached?.data?.value) {
    return defaultValue;
  }

  return cached.data.value;
};

/**
 * Delete a cache value.
 *
 * @param {string} key Key to delete the value for.
 */
const cacheDelete = async (key) => {
  await Promise.all([
    dbDelete('cache', key),
    dbDelete('cache', `expiration-${key}`),
  ]);
};

/**
 * Set a data value.
 *
 * @param {string} key   Key to set the value for.
 * @param {Object} value Value to set.
 */
const dataSet = async (key, value) => {
  await dbSet('data', { id: key, value });
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
  cacheGetNoExpiration,
  cacheSet,
  cacheSetAsync,
  cacheSetExpiration,
  cacheSetNoExpiration,
  clearCaches,
  getData,
  getHeaders,
  updateCaches,
  markCachesAsExpired,
  sessionGet,
  sessionSet,
  sessionDelete,
  sessionsDelete
};
