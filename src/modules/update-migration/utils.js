import {
  debuglog,
  deleteSetting,
  getFlags,
  getSetting,
  saveSetting
} from '@utils';

const isVersionBefore = (version, compare) => {
  if (! version || ! compare) {
    return false;
  }

  const versionParts = version.split('.');
  const compareParts = compare.split('.');

  for (const i in versionParts) {
    if ('*' === compareParts[i]) {
      return false;
    }

    if (versionParts[i] < compareParts[i]) {
      return true;
    }
  }

  return false;
};

const saveSettingsBackup = () => {
  localStorage.setItem('mousehunt-improved-settings-backup', localStorage.getItem('mousehunt-improved-settings'));
};

const restoreSettingsBackup = () => {
  const backedUpSettings = localStorage.getItem('mousehunt-improved-settings-backup');
  if (backedUpSettings) {
    localStorage.setItem('mousehunt-improved-settings', backedUpSettings);
  }
};

/**
 * Migrate a setting.
 *
 * @param {Object} settingKey      The setting key to migrate.
 * @param {string} settingKey.from The setting key to migrate from.
 * @param {string} settingKey.to   The setting key to migrate to.
 */
const moveSetting = (settingKey) => {
  if (! settingKey.from || ! settingKey.to) {
    return;
  }

  debuglog('update-migration', `Migrating setting from ${settingKey.from} to ${settingKey.to}`);
  const setting = getSetting(settingKey.from, null);
  if (null === setting) {
    return;
  }

  // If the destination setting already exists, don't overwrite it
  if (null !== getSetting(settingKey.to, null)) {
    return;
  }

  saveSetting(settingKey.to, setting);

  if (settingKey.clear) {
    saveSetting(settingKey.from, null);
  } else if (settingKey.setTrue) {
    saveSetting(settingKey.from, true);
  } else if (settingKey.setFalse) {
    saveSetting(settingKey.from, false);
  } else {
    deleteSetting(settingKey.from);
  }
};

const moveFlagToSetting = (flag) => {
  if (! flag.from || ! flag.to) {
    return;
  }

  debuglog('update-migration', `Migrating flag from ${flag.from} to setting ${flag.to}`);
  const savedFlags = getFlags();

  // if we have the flag, set the setting to true and remove the flag
  if (savedFlags.includes(flag.from)) {
    saveSetting(flag.to, true);
    savedFlags.splice(savedFlags.indexOf(flag.from), 1);
  }

  // save the remaining flags
  saveSetting('override-flags', savedFlags.join(','));
};

export {
  isVersionBefore,
  saveSettingsBackup,
  restoreSettingsBackup,
  moveSetting,
  moveFlagToSetting
};
