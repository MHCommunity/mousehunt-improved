import {
  addBodyClass,
  debuglog,
  doEvent,
  getData,
  getSetting,
  markCachesAsExpired,
  onEvent,
  saveSetting,
  setGlobal,
  showLoadingPopup,
  updateCaches
} from '@utils';

import * as imported from './versions/*.js'; // eslint-disable-line import/no-unresolved
const versionUpdates = imported;

/**
 * Save the settings backup.
 */
const saveSettingsBackup = () => {
  localStorage.setItem('mousehunt-improved-settings-backup', localStorage.getItem('mousehunt-improved-settings'));
};

/**
 * Restore the settings backup.
 */
const restoreSettingsBackup = () => {
  const backedUpSettings = localStorage.getItem('mousehunt-improved-settings-backup');
  if (backedUpSettings) {
    localStorage.setItem('mousehunt-improved-settings', backedUpSettings);
  }
};

/**
 * Get the needed version updates.
 *
 * @return {Object} The needed version updates.
 */
const getVersionUpdates = () => {
  const neededUpdates = [];

  const updatesCompleted = getSetting('mh-improved-updates-completed', []);
  for (const versionUpdate in Object.values(versionUpdates)) {
    const version = versionUpdates[versionUpdate].version;
    if (! updatesCompleted.includes(version)) {
      neededUpdates.push(versionUpdates[versionUpdate]);
    }
  }

  debuglog('update-migration', 'Needed updates:', neededUpdates);

  return neededUpdates;
};

/**
 * Run the version updates if needed.
 *
 * @param {Array} updates The updates to run.
 */
const doVersionUpdates = async (updates) => {
  for (const version of Object.keys(updates)) {
    const update = versionUpdates[version];
    const updateCompleted = getSetting('mh-improved-updates-completed', []).includes(update.version);

    if (updateCompleted) {
      continue;
    }

    try {
      debuglog('update-migration', `Running update for ${update.version}`);

      try {
        await update.update();
      } catch (error) {
        debuglog('update-migration', `Error running update for ${update.version}`, error);
        throw new Error(`Error running update for ${update.version}: ${error.message}`);
      }

      const updatesCompleted = getSetting('mh-improved-updates-completed', []);
      updatesCompleted.push(update.version);
      saveSetting('mh-improved-updates-completed', updatesCompleted);
    } catch (error) {
      debuglog('update-migration', `Error updating to ${update.version}`, error);
      throw error;
    }
  }
};

/**
 * Run the update migration.
 *
 * @param {string} previousVersion The previous version.
 * @param {string} newVersion      The new version.
 */
const update = async (previousVersion, newVersion) => {
  debuglog('update-migration', `Updating from ${previousVersion} to ${newVersion}`);

  const updates = getVersionUpdates();
  const needsToRunUpdate = updates.length > 0;

  const isFreshInstall = '0.0.0' === previousVersion;

  // If we dont' have settings to migrate, just save the new version and return.
  if (! needsToRunUpdate) {
    saveSetting('mh-improved-version', newVersion);
    updateCaches();
    if (isFreshInstall) {
      return;
    }

    doEvent('mh-improved-updated', previousVersion);
    return;
  }

  let popup;

  // Backup the settings before we start updating in case something goes wrong.
  if (! isFreshInstall) {
    popup = showLoadingPopup(`Updating MouseHunt Improved to v${newVersion}…`);

    addBodyClass('mh-improved-updating');
    setGlobal('mh-improved-updating', true);

    saveSettingsBackup();
  }

  try {
    if (! isFreshInstall) {
      await doVersionUpdates(updates);
    }
    saveSetting('mh-improved-version', newVersion);

    await markCachesAsExpired();

    // Get fresh data for items and mice.
    await getData('items', true);
    await getData('mice', true);
    await getData('upscaled-images', true);

    if (isFreshInstall) {
      return;
    }

    popup = showLoadingPopup(`MouseHunt Improved has been updated to v${newVersion}!`);

    onEvent('mh-improved-init', () => {
      popup.hide();

      doEvent('mh-improved-updated', previousVersion);
    }, true);
  } catch (error) {
    // If something goes wrong, restore the settings from the backup
    restoreSettingsBackup();

    // Show the error to the user.
    showLoadingPopup('Error updating MouseHunt Improved. Please try refreshing the page.');

    throw error;
  }

  console.log(`Updated MouseHunt Improved to v${newVersion}`); // eslint-disable-line no-console
};

/**
 * Initialize the update migration.
 *
 * @param {string} previousVersion The previous version.
 * @param {string} newVersion      The new version.
 */
export default async (previousVersion, newVersion) => {
  if (previousVersion !== newVersion) {
    debuglog('update-migration', `Previous version: ${previousVersion}`);
    await update(previousVersion, newVersion);
    doEvent('mh-improved-updated', newVersion);
  }
};
