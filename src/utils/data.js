import { dbDelete, dbDeleteAll, dbGet, dbSet } from './db';
import { debuglog } from './debug';
import { getSetting } from './settings';
import { safeJsonParse } from './json';

const validDataFiles = new Set([
  'brift-mice-per-mist-level',
  'community-map-data',
  'cre-mice-groups',
  'effs',
  'environments-events',
  'environments',
  'item-thumbnails',
  'items-tradable',
  'items',
  'library-assignments',
  'map-groups',
  'm400-locations',
  'marketplace-hidden-items',
  'mice-groups',
  'mice-regions',
  'mice-silhouettes',
  'mice-thumbnails',
  'mice',
  'journals-environment-mapping',
  'journals-events',
  'minlucks',
  'relic-hunter-hints',
  'scoreboards',
  'scrolls-to-maps',
  'titles',
  'trap-special-effects',
  'ultimate-checkmark',
  'upscaled-images',
  'wisdom',
]);

const dataFilesToPreload = [
  'environments-events',
  'environments',
  'item-thumbnails',
  'items',
  'map-groups',
  'mice-groups',
  'mice-regions',
  'mice-thumbnails',
  'mice',
  'upscaled-images',
];

/**
 * Build the normalized session storage key.
 *
 * @param {string} key The raw key.
 *
 * @return {string} The normalized key.
 */
const getSessionStorageKey = (key) => {
  return key.startsWith('mh-improved-') ? key : `mh-improved-${key}`;
};

/**
 * Build the legacy double-prefixed session storage key.
 *
 * @param {string} key The raw key.
 *
 * @return {string|null} The legacy key, if applicable.
 */
const getLegacySessionStorageKey = (key) => {
  if (! key.startsWith('mh-improved-')) {
    return null;
  }

  return `mh-improved-${key}`;
};

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
 * @param {number} [time=null] Time in milliseconds since epoch. If null, defaults to 3-6 days from now.
 *
 * @return {Promise<void>} Resolves when the expiration is set.
 */
const cacheSetExpiration = async (key, time = null) => {
  if (time) {
    return await dbSet('cache', { id: `expiration-${key}`, value: Date.now() + time });
  }

  const expirationTime = Date.now() + ((Math.floor(Math.random() * 4) + 3) * 24 * 60 * 60 * 1000);
  return await dbSet('cache', { id: `expiration-${key}`, value: expirationTime });
};

/**
 * Expire the cache for the given key.
 *
 * @param {string} key Key to expire.
 *
 * @return {Promise<void>} Resolves when the cache is expired.
 */
const cacheExpire = async (key) => {
  return await dbSet('cache', { id: `expiration-${key}`, value: Date.now() - 1000 });
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

    if (! data.ok) {
      throw new Error(`Failed to fetch data for ${key}: ${data.status} ${data.statusText}`);
    }

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
 * Fetch a resource from the api.mouse.rip API, applying the standard headers.
 *
 * Use this for per-id lookups that aren't whitelisted data files (which should
 * go through getData instead).
 *
 * @param {string}  path        The path to fetch, without the leading slash.
 * @param {Object}  [opts]      The options.
 * @param {boolean} [opts.json] Whether to parse the response as JSON (default true).
 *
 * @return {Promise<Object|string|null>} The parsed response, or null on failure.
 */
const fetchMouseRip = async (path, { json = true } = {}) => {
  try {
    const response = await fetch(`https://api.mouse.rip/${path}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (! response.ok) {
      return null;
    }

    return json ? await response.json() : await response.text();
  } catch (error) {
    console.error(`Error fetching ${path} from mouse.rip:`, error); // eslint-disable-line no-console
    return null;
  }
};

/**
 * Check that fetched or cached data is a non-empty object or array.
 *
 * @param {Object|Array} data Data to check.
 *
 * @return {boolean} Whether the data is valid.
 */
const hasValidData = (data) => {
  if (Array.isArray(data)) {
    return data.length > 0;
  }

  return Boolean(data && typeof data === 'object' && Object.keys(data).length > 0);
};

/**
 * Fetch the content versions for all extension data files.
 *
 * @return {Promise<Object|null>} The version map, or null on failure.
 */
const fetchDataVersions = async () => {
  const versions = await fetchMouseRip('versions');
  if (! versions || typeof versions !== 'object' || Array.isArray(versions)) {
    return null;
  }

  return versions;
};

/**
 * Get the version stored atomically with a cached dataset.
 *
 * @param {string} key Data-file key.
 *
 * @return {Promise<string|null>} The stored version.
 */
const getCachedDataVersion = async (key) => {
  const cached = await dbGet('cache', key);
  return cached?.data?.version || null;
};

/**
 * Get the data for the given key.
 *
 * @param {string}  key             Key to get the data for.
 * @param {boolean} force           Whether to force fetching the data.
 * @param {string}  expectedVersion Version expected after a successful fetch.
 *
 * @return {Object} The data.
 */
const getData = async (key, force = false, expectedVersion = null) => {
  if (! isValidDataFile(key)) {
    console.error(`Invalid data file requested: ${key}`); // eslint-disable-line no-console
    return {};
  }

  if (! force) {
    const cachedData = await cacheGet(key, false);
    if (hasValidData(cachedData)) {
      return cachedData;
    }
  }

  debuglog('utils-data', `Fetching data for ${key}…`);
  const data = await fetchData(key);
  debuglog('utils-data', `Fetched data for ${key}`, data);

  if (hasValidData(data)) {
    if (! expectedVersion) {
      const versions = await cacheGetNoExpiration('data-versions', {});
      expectedVersion = versions[key] || null;
    }

    await cacheSet(key, data, null, expectedVersion);

    return data;
  }

  // Fetch failed or is empty.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const retryData = await fetchData(key);
  if (hasValidData(retryData)) {
    if (! expectedVersion) {
      const versions = await cacheGetNoExpiration('data-versions', {});
      expectedVersion = versions[key] || null;
    }

    await cacheSet(key, retryData, null, expectedVersion);
    return retryData;
  }

  return {};
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
 *
 * @param {boolean} all                      Whether to update all data files.
 * @param {boolean} downloadOnVersionFailure Whether to use the legacy full-download fallback.
 *
 * @return {Promise<boolean>} Whether the version check succeeded.
 */
const updateCaches = async (all = false, downloadOnVersionFailure = true) => {
  const filesToUpdate = all ? validDataFiles : dataFilesToPreload;
  const versions = await fetchDataVersions();

  if (! versions && ! downloadOnVersionFailure) {
    return false;
  }

  if (versions) {
    await cacheSetNoExpiration('data-versions', versions);
  }

  const changedFiles = new Set();

  for (const file of validDataFiles) {
    const cachedData = await cacheGetNoExpiration(file, null);
    const cachedVersion = await getCachedDataVersion(file);
    const serverVersion = versions?.[file];

    if (serverVersion && cachedVersion === serverVersion && hasValidData(cachedData)) {
      await cacheSetExpiration(file);
      continue;
    }

    await cacheExpire(file);
    changedFiles.add(file);
  }

  for (const file of filesToUpdate) {
    if (versions && ! changedFiles.has(file)) {
      continue;
    }

    await getData(file, true, versions?.[file] || null);

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  if (versions) {
    await cacheSetNoExpiration('data-versions-last-checked', Date.now());
  }

  // Clear CRE caches to force refresh.
  cacheDelete('cre-location');
  cacheDelete('cre-stats');
  cacheDelete('cre-effectiveness');

  return Boolean(versions);
};

/**
 * Check for data updates at most once every three hours.
 *
 * @return {Promise<boolean>} Whether a version check was performed successfully.
 */
const checkForDataUpdates = async () => {
  const lastChecked = await cacheGetNoExpiration('data-versions-last-checked', 0);
  if (Date.now() - lastChecked < 3 * 60 * 60 * 1000) { // 3 hours.
    return false;
  }

  // A background check should keep existing data when the versions endpoint
  // is temporarily unavailable. Explicit update flows retain the legacy
  // full-download fallback through updateCaches' default argument.
  return await updateCaches(false, false);
};

/**
 * Mark all caches as expired.
 */
const markCachesAsExpired = async () => {
  for (const file of validDataFiles) {
    await cacheExpire(file);
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

  const storageKey = getSessionStorageKey(key);
  const stringified = JSON.stringify(value);

  try {
    sessionStorage.setItem(storageKey, stringified);
  } catch (error) {
    if ('QuotaExceededError' === error.name && ! retry) {
      void clearCaches()
        .catch(() => {})
        .finally(() => {
          sessionSet(key, value, true);
        });
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

  const storageKey = getSessionStorageKey(key);
  const legacyKey = getLegacySessionStorageKey(key);
  const value = sessionStorage.getItem(storageKey) ?? (legacyKey ? sessionStorage.getItem(legacyKey) : null);
  if (! value) {
    return defaultValue;
  }

  return safeJsonParse(value, defaultValue, (error) => {
    console.error(`Error parsing session storage for ${storageKey}:`, error); // eslint-disable-line no-console
  });
};

/**
 * Delete a session value.
 *
 * @param {string} key Key to delete the value for.
 */
const sessionDelete = (key) => {
  const storageKey = getSessionStorageKey(key);
  const legacyKey = getLegacySessionStorageKey(key);

  sessionStorage.removeItem(storageKey);
  if (legacyKey) {
    sessionStorage.removeItem(legacyKey);
  }
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
 * Get a value from localStorage, safely JSON-parsing it.
 *
 * Use this for reading raw localStorage keys (e.g. Keys written by third-party
 * userscripts). For in-house caching, prefer cacheGet/sessionGet..
 *
 * @template T
 * @param {string} key            Key to get the value for.
 * @param {T}      [defaultValue] Default value if the key is missing or invalid.
 *
 * @return {T} The parsed value, or the default.
 */
const lsGet = (key, defaultValue = null) => {
  const value = localStorage.getItem(key);
  if (null === value) {
    return defaultValue;
  }

  return safeJsonParse(value, defaultValue, (error) => {
    console.error(`Error parsing localStorage for ${key}:`, error); // eslint-disable-line no-console
  });
};

/**
 * Set a value in localStorage, JSON-stringifying it.
 *
 * @param {string} key   Key to set the value for.
 * @param {Object} value Value to set.
 */
const lsSet = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Set a cache value.
 *
 * @param {string} key               Key to set the value for.
 * @param {Object} value             Value to set.
 * @param {number} [expiration=null] Expiration time in milliseconds since epoch. If null, defaults to 3-6 days.
 * @param {string} [version=null]    Content version stored with this dataset.
 *
 * @return {Promise<Object>} The value that was set.
 */
const cacheSet = async (key, value, expiration = null, version = null) => {
  await Promise.all([
    dbSet('cache', { id: key, value, version }),
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
  cacheExpire,
  cacheSetNoExpiration,
  checkForDataUpdates,
  clearCaches,
  getData,
  fetchMouseRip,
  lsGet,
  lsSet,
  getHeaders,
  updateCaches,
  markCachesAsExpired,
  sessionGet,
  sessionSet,
  sessionDelete,
  sessionsDelete
};
