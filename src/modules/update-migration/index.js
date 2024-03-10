import {
  addBodyClass,
  clearCaches,
  getSetting,
  getSettings,
  refreshPage,
  saveSetting,
  databaseDelete,
  setGlobal,
  showLoadingPopup,
  sleep
} from '@utils';

import { cleanupCacheArSettings, cleanupSettings, removeOldEventFavoriteLocations } from './settings-cleanup';
import { migrateJournalChangerDate, migrateQuestsCache, migrateSettings, migrateWisdomStat } from './settings-migrate';

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

  addBodyClass('mh-improved-updating');
  setGlobal('mh-improved-updating', true);

  // We don't want to show the popup, close it, and refresh all super fast, so add some artificial delay.
  await sleep(3000);

  const current = getSettings();
  localStorage.setItem('mousehunt-improved-settings-migration-backup', JSON.stringify(current));

  migrateSettings(settingsToMigrate);

  migrateQuestsCache();
  migrateWisdomStat();
  migrateJournalChangerDate();

  cleanupCacheArSettings();
  removeOldEventFavoriteLocations();
  cleanupSettings([
    `mh-improved-cached-ar-v${previousVersion}`,
    'mh-improved-update-notifications', // Updated in v0.28.0.
  ]);

  // Moved to 'mh-improved-<id>' databases in v0.35.0.
  await databaseDelete('mh-improved');

  await clearCaches();

  saveSetting('mh-improved-version', newVersion);

  refreshPage();
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
