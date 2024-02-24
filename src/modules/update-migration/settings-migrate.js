import {
  cacheSet,
  debuglog,
  deleteSetting,
  getSetting,
  saveSetting
} from '@utils';

/**
 * Migrate a setting.
 *
 * @param {Object} settingKey      The setting key to migrate.
 * @param {string} settingKey.from The setting key to migrate from.
 * @param {string} settingKey.to   The setting key to migrate to.
 */
const migrateSetting = (settingKey) => {
  debuglog('update-migration', `Migrating setting from ${settingKey.from} to ${settingKey.to}`);
  const setting = localStorage.getItem(settingKey.from);
  if (null === setting) {
    return;
  }

  saveSetting(settingKey.to, JSON.parse(setting));

  localStorage.removeItem(settingKey.from);
};

/**
 * Migrate settings.
 *
 * @param {Array} settings The settings to migrate.
 */
const migrateSettings = (settings) => {
  settings.forEach((setting) => {
    migrateSetting(setting);
  });
};

const migrateQuestsCache = () => {
  debuglog('update-migration', 'Migrating quests cache');
  const savedQuests = localStorage.getItem('mh-improved-cache-quests');
  if (null === savedQuests) {
    return;
  }

  const quests = JSON.parse(savedQuests);

  cacheSet('quests', quests);

  localStorage.removeItem('mh-improved-cache-quests');
};

const migrateWisdomStat = () => {
  debuglog('update-migration', 'Migrating wisdom stat');
  const wisdomStat = getSetting('wisdom-stat');
  if (null === wisdomStat) {
    return;
  }

  const lastUpdated = wisdomStat['last-updated'] || 0;
  const value = wisdomStat.value || 0;

  cacheSet('wisdom-stat-last-updated', lastUpdated);
  cacheSet('wisdom-stat-value', value);

  deleteSetting('wisdom-stat');
};

const migrateJournalChangerDate = async () => {
  debuglog('update-migration', 'Migrating journal changer date');
  const last = getSetting('journal-changer-last-change', 0);
  cacheSet('journal-changer-last-change', last);

  deleteSetting('journal-changer-last-change');
};

export {
  migrateSettings,
  migrateQuestsCache,
  migrateWisdomStat,
  migrateJournalChangerDate
};
