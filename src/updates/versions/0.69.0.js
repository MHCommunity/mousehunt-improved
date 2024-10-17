import {
  cacheDelete,
  dataSet,
  dbDeleteAll,
  dbGet,
  debuglog
} from '@utils';

const removeRetiredDbs = async () => {
  try {
    await indexedDB.deleteDatabase('mh-improved-ar-cache');
  } catch (error) {
    debuglog('update-0.69.0', 'Error deleting mh-improved-ar-cache db', error);
  }
};

const clearDataCache = async () => {
  await dbDeleteAll('mh-improved-data');
};

const moveFromCacheToDataDb = async () => {
  const keys = [
    'fulmina_charged_tooth_stat_item-quantity',
    'printing_press_charge_stat_item-quantity',
    'pb-stats',
    'quests',
  ];

  for (const key of keys) {
    const value = await dbGet('cache', key);
    dataSet(key, value);

    cacheDelete(key);
  }
};

const update = async () => {
  await moveFromCacheToDataDb();
  await clearDataCache();
  await removeRetiredDbs();
  return true;
};

export default {
  version: '0.69.0',
  update
};
