import { getSetting, saveSetting } from './settings';

let flags = null;
const settings = {};

/**
 * Check if the given flag is enabled.
 *
 * @param {string} flag Flag to check.
 *
 * @return {boolean} Whether the flag is enabled.
 */
const getFlag = (flag) => {
  if (flag in settings) {
    return settings[flag];
  }

  const value = getSetting(`experiments.${flag}`, getFlags().includes(flag));
  settings[flag] = value;
  return value;
};

/**
 * Get the list of enabled flags.
 *
 * @return {Array} List of enabled flags.
 */
const getFlags = () => {
  if (! flags) {
    flags = getSetting('override-flags', '').toLowerCase().replaceAll(' ', '').split(',');
  }

  return flags;
};

/**
 * Migrate a flag from an old key to a new key.
 *
 * @param {string} oldKey The old key of the flag.
 * @param {string} newKey The new key of the flag.
 */
const migrateFlag = (oldKey, newKey) => {
  const overrideFlags = getSetting('override-flags', '');
  const newOverrideFlags = overrideFlags.replaceAll(oldKey, newKey);
  if (newOverrideFlags !== overrideFlags) {
    settings['override-flags'] = newOverrideFlags;
    saveSetting('override-flags', newOverrideFlags);
  }
};

export {
  getFlag,
  getFlags,
  migrateFlag
};
