import {
  addBodyClass,
  debuglog,
  doEvent,
  getGlobal,
  getSetting,
  saveSetting,
  setGlobal,
  showLoadingPopup,
  updateCaches
} from '@utils';

import { isVersionBefore, restoreSettingsBackup, saveSettingsBackup } from './utils';

import * as imported from './versions/*.js'; // eslint-disable-line import/no-unresolved
const versionUpdates = imported;

const doVersionUpdates = async () => {
  if ('0.0.0' === previousVersion) {
    return;
  }

  for (const version in versionUpdates) {
    const currentVersion = versionUpdates[version];
    if (isVersionBefore(previousVersion, currentVersion.id)) {
      try {
        await currentVersion.update();
      } catch (error) {
        debuglog('update-migration', `Error updating to ${currentVersion.id}:`, error);
        throw error;
      }
    }
  }
};

const update = async () => {
  debuglog('update-migration', `Updating from ${previousVersion} to ${mhImprovedVersion}`);

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

    if (getGlobal('mh-improved-update-needs-refresh')) {
      showLoadingPopup('MouseHunt Improved has been updated. Please refresh the page.');
    } else {
      activejsDialog?.hide();
    }

    doEvent('mh-improved-updated', mhImprovedVersion);
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

export default {
  id: 'update-migration',
  type: 'required',
  alwaysLoad: true,
  order: 300,
  load: init,
};
