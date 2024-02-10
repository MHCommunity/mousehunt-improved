import { debug, getSetting, saveSetting } from '@utils';

import cleanupSettings from './settings-cleanup';
import migrateSettings from './settings-migrate';

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

const cleanOnUpdate = (previousVersion) => {
  migrateSettings([
    {
      from: 'mh-improved-visibility-toggles', // Updated in v0.26.0.
      to: 'farm-visibility-toggles',
    },
    {
      from: 'mh-improved-better-travel', // Updated in v0.28.0.
      to: 'better-travel',
    },
  ]);

  cleanupSettings([
    'mh-improved-cache-ar',
    'mh-improved-cached-ar-v0.21.0',
    'mh-improved-cached-ar-v0.24.1',
    'mh-improved-cached-ar-v0.25.2', // Versions before we saved the version in the settings.
    `mh-improved-cached-ar-v${previousVersion}`,
    'mh-improved-update-notifications', // Updated in v0.28.0.
  ]);
};

const init = async () => {
  const installedVersion = getSetting('mh-improved-version', null);
  if (! isNewVersion(installedVersion)) {
    return;
  }

  debug(`New version: ${mhImprovedVersion}, updating from ${installedVersion}`);

  cleanOnUpdate(installedVersion);

  saveSetting('mh-improved-version', mhImprovedVersion);
  saveSetting('mh-improved-platform', mhImprovedPlatform);
};

export default {
  id: 'update-migration',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
