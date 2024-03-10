import {
  clearCaches,
  debug,
  getSetting,
  getSettings,
  saveSetting
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
 */
const cleanOnUpdate = (previousVersion) => {
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
};

/**
 * Initialize the update migration.
 */
const init = async () => {
  const installedVersion = getSetting('mh-improved-version', null);
  if (! isNewVersion(installedVersion)) {
    return;
  }

  debug(`New version: ${mhImprovedVersion}, updating from ${installedVersion}`);

  cleanOnUpdate(installedVersion);

  await clearCaches();

  saveSetting('mh-improved-platform', mhImprovedPlatform);
  saveSetting('mh-improved-version', mhImprovedVersion);

  // reload the page to ensure everything is updated.
  window.location.reload();
};

export default {
  id: 'update-migration',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
