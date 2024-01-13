import { debuglog } from './debug';

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
    headers: {
      'Content-Type': 'application/json',
    },
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

  localStorage.removeItem(getCacheExpirationKey());
};

export {
  getData,
  clearCaches
};
