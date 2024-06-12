import {
  addBodyClass,
  debuglog,
  doEvent,
  getSetting,
  refreshPage,
  saveSetting,
  setGlobal,
  showLoadingPopup,
  updateCaches
} from '@utils';

import { isVersionBefore, restoreSettingsBackup, saveSettingsBackup } from './utils';

import * as imported from './versions/*.js'; // eslint-disable-line import/no-unresolved
const versionUpdates = imported;

/**
 * Get the version update routines.
 *
 * @return {Object} The version update routines.
 */
const getVersionUpdates = () => {
  const updates = {};

  for (const version in versionUpdates) {
    const currentVersion = versionUpdates[version];
    if (isVersionBefore(previousVersion, currentVersion.id)) {
      updates[currentVersion.id] = currentVersion;
    }
  }

  return updates;
};

/**
 * Run the version updates if needed.
 */
const doVersionUpdates = async () => {
  if ('0.0.0' === previousVersion) {
    return;
  }

  const updates = getVersionUpdates();
  for (const version in updates) {
    const update = updates[version];
    try {
      debuglog('update-migration', `Running update for ${version}`);
      await update.update();
    } catch (error) {
      debuglog('update-migration', `Error updating to ${version}:`, error);
      throw error;
    }
  }
};

/**
 * Run the update migration.
 */
const update = async () => {
  debuglog('update-migration', `Updating from ${previousVersion} to ${mhImprovedVersion}`);

  const updates = getVersionUpdates();
  const needsMigration = Object.keys(updates).length > 0;

  const showPopup = setTimeout(() => {
    showLoadingPopup(`Updating MouseHunt Improved to v${mhImprovedVersion}...`);
    addBodyClass('mh-improved-updating');
    setGlobal('mh-improved-updating', true);

    // Backup the settings before we start updating in case something goes wrong.
    saveSettingsBackup();
  }, 400);

  try {
    await doVersionUpdates();
    saveSetting('mh-improved-version', mhImprovedVersion);

    await updateCaches();

    clearTimeout(showPopup);

    if (needsMigration) {
      showLoadingPopup('MouseHunt Improved has been updated. Refresh the page to continue.');
      setTimeout(refreshPage, 3000);
    } else if (activejsDialog && activejsDialog?.hide) {
      activejsDialog.hide();
    }

    doEvent('mh-improved-updated', previousVersion);
  } catch (error) {
    // If something goes wrong, restore the settings from the backup
    restoreSettingsBackup();

    clearTimeout(showPopup);

    // Show the error to the user.
    showLoadingPopup('Error updating MouseHunt Improved. Please try refreshing the page.');

    throw error;
  }
};

let previousVersion = null;

/**
 * Initialize the update migration.
 */
const init = async () => {
  previousVersion = getSetting('mh-improved-version', '0.0.0');
  if ('0.0.0' === previousVersion) {
    return;
  }

  if (previousVersion !== mhImprovedVersion) {
    debuglog('update-migration', `Previous version: ${previousVersion}`);
    await update();
    doEvent('mh-improved-updated', mhImprovedVersion);
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'update-migration',
  type: 'required',
  alwaysLoad: true,
  order: 300,
  load: init,
};
