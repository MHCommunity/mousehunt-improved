import { debuglog } from './debug';
import { getFlag } from './flags';

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

const getCacheKey = (key) => {
  return `mh-improved-cached-data--${key}`;
};

const getCacheExpirationKey = () => {
  return 'mh-improved-cached-data-expiration';
};

const getCacheExpirations = () => {
  return JSON.parse(localStorage.getItem(getCacheExpirationKey())) || {};
};

const getCacheExpiration = (key) => {
  const allCacheExpirations = getCacheExpirations();

  return allCacheExpirations[key] || {
    date: 0,
    version: 0,
  };
};

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

const setCachedData = (key, data) => {
  const cacheKey = getCacheKey(key);

  localStorage.setItem(cacheKey, JSON.stringify(data));
  setCacheExpiration(key);
};

const fetchAndCacheData = async (key) => {
  const data = await fetch(`https://api.mouse.rip/${key}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const json = await data.json();

  setCachedData(key, json);

  return json;
};

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

const clearCaches = () => {
  const allCacheExpirations = getCacheExpirations();

  for (const key of Object.keys(allCacheExpirations)) {
    localStorage.removeItem(getCacheKey(key));
  }

  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith('mh-improved')) {
      sessionStorage.removeItem(key);
    }
  }

  localStorage.removeItem(getCacheExpirationKey());
};

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-MH-Improved': 'true',
    'X-MH-Improved-Version': mhImprovedVersion,
    'X-MH-Improved-Platform': mhImprovedPlatform,
  };
};

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
