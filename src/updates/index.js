import {
  addBodyClass,
  addStyles,
  createPopup,
  debuglog,
  doEvent,
  getFlag,
  getSetting,
  onEvent,
  saveSetting,
  setGlobal,
  showLoadingPopup,
  updateCaches
} from '@utils';

import errorPopupStyles from './error-popup.css';

import * as imported from './versions/*.js'; // eslint-disable-line import/no-unresolved
const versionUpdates = imported;

/**
 * Save the settings backup.
 */
const saveSettingsBackup = () => {
  const settings = localStorage.getItem('mousehunt-improved-settings');
  if (! settings) {
    return;
  }

  localStorage.setItem('mousehunt-improved-settings-backup', settings);
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

  const updatesCompleted = getSetting('updates-completed', []);
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
  for (const update of updates) {
    const updateCompleted = getSetting('updates-completed', []).includes(update.version);
    if (updateCompleted) {
      continue;
    }

    try {
      debuglog('update-migration', `Running update for ${update.version}`);

      try {
        await update.update();

        const updatesCompleted = getSetting('updates-completed', []);
        updatesCompleted.push(update.version);
        saveSetting('updates-completed', updatesCompleted);
        debuglog('update-migration', `Completed update for ${update.version}`);
      } catch (error) {
        debuglog('update-migration', `Error running update for ${update.version}`, error);
        throw new Error(`Error running update for ${update.version}: ${error.message}`);
      }
    } catch (error) {
      debuglog('update-migration', `Error updating to ${update.version}`, error);
      throw error;
    }
  }
};

/**
 * Show the update error popup with the error details and recovery actions.
 *
 * @param {Error}  error           The error that occurred.
 * @param {string} previousVersion The version being updated from.
 * @param {string} newVersion      The version being updated to.
 * @param {Array}  updates         The version updates that were pending.
 */
const showUpdateError = (error, previousVersion, newVersion, updates) => {
  const details = (error?.message || String(error))
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  const popup = createPopup({
    title: `Error updating MouseHunt Improved to v${newVersion}`,
    content: `<div class="mh-improved-update-error">
      <p>Something went wrong while updating. You can retry, or continue with the new version without re-running the update steps.</p>
      <p>If this keeps happening, please <a href="https://github.com/MHCommunity/mousehunt-improved/issues" target="_blank" rel="noreferrer">report it on GitHub</a>.</p>
      <pre>${details}</pre>
      <div class="mh-improved-update-error-buttons">
        <a href="#" id="mh-improved-update-retry" class="mousehuntActionButton"><span>Retry update</span></a>
        <a href="#" id="mh-improved-update-continue" class="mousehuntActionButton lightBlue"><span>Continue anyway</span></a>
      </div>
    </div>`,
    className: 'mh-improved-update-error-popup',
    hasCloseButton: false,
  });

  if (! popup) {
    showLoadingPopup(`Error updating MouseHunt Improved to v${newVersion}. Please try refreshing the page.`);
    return;
  }

  addStyles(errorPopupStyles, 'mh-improved-update-error-styles');

  const retryButton = document.querySelector('#mh-improved-update-retry');
  retryButton?.addEventListener('click', (event) => {
    event.preventDefault();

    // Revert the saved version so the update re-runs on the reload.
    saveSetting('mh-improved-version', previousVersion);
    window.location.reload();
  });

  const continueButton = document.querySelector('#mh-improved-update-continue');
  continueButton?.addEventListener('click', (event) => {
    event.preventDefault();

    // Mark the pending migrations as completed so they aren't retried on the
    // next release either.
    const updatesCompleted = getSetting('updates-completed', []);
    for (const pendingUpdate of updates) {
      if (! updatesCompleted.includes(pendingUpdate.version)) {
        updatesCompleted.push(pendingUpdate.version);
      }
    }

    saveSetting('updates-completed', updatesCompleted);
    saveSetting('mh-improved-version', newVersion);
    window.location.reload();
  });
};

/**
 * Run the update migration.
 *
 * @param {string} previousVersion The previous version.
 * @param {string} newVersion      The new version.
 *
 * @return {Promise<boolean>} Whether the update completed successfully.
 */
const update = async (previousVersion, newVersion) => {
  debuglog('update-migration', `Updating from ${previousVersion} to ${newVersion}`);

  const updates = getVersionUpdates();
  const needsToRunUpdate = updates.length > 0;

  const isFreshInstall = '0.0.0' === previousVersion;

  let popup;

  // Backup the settings before we start updating in case something goes wrong.
  if (! isFreshInstall) {
    popup = showLoadingPopup(`Updating MouseHunt Improved to v${newVersion}…`);

    addBodyClass('mh-improved-updating');
    setGlobal('mh-improved-updating', true);

    saveSettingsBackup();
  }

  try {
    // Allow testing the update-failed popup by setting the 'test-update-error' flag.
    if (! isFreshInstall && getFlag('test-update-error')) {
      throw new Error('Simulated update failure via the "test-update-error" flag.');
    }

    if (! isFreshInstall && needsToRunUpdate) {
      debuglog('update-migration', 'Running version updates:', updates);
      await doVersionUpdates(updates);
    }

    saveSetting('mh-improved-version', newVersion);

    if (isFreshInstall) {
      saveSetting('onboarding.fresh-install', true);
    }

    // Cache priming is only a warm-up — data is refetched on demand — so a
    // failure here (e.g. unavailable IndexedDB) shouldn't abort the update.
    try {
      await updateCaches();
    } catch (error) {
      debuglog('update-migration', 'Error priming caches during update', error);
    }

    if (isFreshInstall) {
      return true;
    }

    popup = showLoadingPopup(`MouseHunt Improved has been updated to v${newVersion}!`);

    onEvent('mh-improved-init', () => {
      popup.hide();

      doEvent('mh-improved-updated', previousVersion);
    }, true);
  } catch (error) {
    // If something goes wrong, restore the settings from the backup, but keep
    // the new version number — the backup contains the old one, and restoring
    // it would re-run this update (and re-show this error) on every page load.
    restoreSettingsBackup();
    saveSetting('mh-improved-version', newVersion);

    popup?.hide?.();
    showUpdateError(error, previousVersion, newVersion, updates);
    setGlobal('mh-improved-updating', false);

    return false;
  }

  setGlobal('mh-improved-updating', false);
  console.log(`Updated MouseHunt Improved to v${newVersion}`); // eslint-disable-line no-console

  return true;
};

/**
 * Initialize the update migration.
 *
 * @param {string} previousVersion The previous version.
 * @param {string} newVersion      The new version.
 *
 * @return {Promise<boolean>} Whether the update completed successfully.
 */
export default async (previousVersion, newVersion) => {
  if (previousVersion !== newVersion) {
    debuglog('update-migration', `Previous version: ${previousVersion}`);

    const updated = await update(previousVersion, newVersion);
    if (! updated) {
      return false;
    }

    doEvent('mh-improved-updated', newVersion);
  }

  return true;
};
