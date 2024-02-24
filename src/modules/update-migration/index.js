import { clearCaches, debug, getSetting, saveSetting } from '@utils';

import { cleanupCacheArSettings, cleanupSettings, removeOldEventFavoriteLocations } from './settings-cleanup';
import { migrateJournalChangerDate, migrateQuestsCache, migrateSettings, migrateWisdomStat } from './settings-migrate';

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
  migrateSettings([
    {
      from: 'mh-improved-visibility-toggles', // Updated in v0.26.0.
      to: 'farm-visibility-toggles',
    },
    {
      from: 'mh-improved-better-travel', // Updated in v0.28.0.
      to: 'better-travel-settings',
    },
  ]);

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

  clearCaches();

  saveSetting('mh-improved-version', mhImprovedVersion);
  saveSetting('mh-improved-platform', mhImprovedPlatform);
};

export default {
  id: 'update-migration',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
