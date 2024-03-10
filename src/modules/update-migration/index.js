import {
  addBodyClass,
  clearCaches,
  fillDataCaches,
  databaseDelete,
  getSetting,
  getSettings,
  refreshPage,
  saveSetting,
  setGlobal,
  showLoadingPopup,
  sleep,
  debuglog
} from '@utils';

import { cleanupCacheArSettings, cleanupSettings, removeOldEventFavoriteLocations } from './settings-cleanup';
import {
  migrateFlags,
  migrateJournalChangerDate,
  migrateQuestsCache,
  migrateSettings,
  migrateWisdomStat
} from './settings-migrate';

import settingsToMigrate from './settings-to-migrate.json';

/**
 * Check if the version is new.
 *
 * @param {string} version The version to check.
 *
 * @return {boolean} True if it's a new version, false otherwise.
 */
const isNewVersion = (version) => {
  const currentVersion = mhImprovedVersion;

  // If it's not set, then it's a new install (or an update from before this was added).
  if (version === null) {
    return true;
  }

  // If it's not the same, then it's an update.
  if (version !== currentVersion) {
    return true;
  }

  // Otherwise, it's the same version.
  return false;
};

/**
 * Clean up settings on update.
 *
 * @param {string} previousVersion The previous version.
 * @param {string} newVersion      The new version.
 */
const update = async (previousVersion, newVersion) => {
  showLoadingPopup(`Updating MouseHunt Improved to v${newVersion}...`);

  saveSetting('debug.all', true);

  addBodyClass('mh-improved-updating');
  setGlobal('mh-improved-updating', true);

  const start = Date.now();

  const current = getSettings();
  localStorage.setItem('mousehunt-improved-settings-backup', JSON.stringify(current));

  debuglog('update-migration', 'Migrating settings');
  migrateSettings(settingsToMigrate.settings);

  debuglog('update-migration', 'Migrating flags');
  migrateFlags(settingsToMigrate.flags);

  debuglog('update-migration', 'Migrating quests cache');
  migrateQuestsCache();

  debuglog('update-migration', 'Migrating other settings');
  migrateWisdomStat();

  debuglog('update-migration', 'Migrating journal changer date');
  migrateJournalChangerDate();

  debuglog('update-migration', 'Cleaning up settings');
  cleanupCacheArSettings();

  debuglog('update-migration', 'Cleaning up old event favorite locations');
  removeOldEventFavoriteLocations();

  debuglog('update-migration', 'Cleaning up old databases');
  cleanupSettings([
    `mh-improved-cached-ar-v${previousVersion}`,
    'mh-improved-update-notifications', // Updated in v0.28.0.
  ]);

  // Moved to 'mh-improved-<id>' databases in v0.35.0.
  debuglog('update-migration', 'Deleting old databases');
  await databaseDelete('mh-improved');

  // Clear caches and then refetch the data.
  debuglog('update-migration', 'Clearing caches');
  await clearCaches();

  debuglog('update-migration', 'Filling data caches');
  await fillDataCaches();

  const end = Date.now();

  // Because we are showing a loading popup, we want to make sure it's shown for at least 3 seconds.
  if (end - start < 3000) {
    await sleep(3000 - (end - start));
  }

  saveSetting('mh-improved-version', newVersion);

  // refreshPage();
};

/**
 * Initialize the update migration.
 */
const init = async () => {
  const installedVersion = getSetting('mh-improved-version', null);
  if (installedVersion === null) {
    await update(null, mhImprovedVersion);
    return;
  }

  if (! isNewVersion(installedVersion)) {
    return;
  }

  await update(installedVersion, mhImprovedVersion);
};

export default {
  id: '_update-migration',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
