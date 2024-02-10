import { getSetting } from './settings';

/**
 * Check if the given flag is enabled.
 *
 * @param {string} flag Flag to check.
 *
 * @return {boolean} Whether the flag is enabled.
 */
const getFlag = (flag) => {
  const flags = getSetting('override-flags');
  if (! flags) {
    return false;
  }

  // split the flags into an array and check if the flag is in the array
  return flags.toLowerCase().replaceAll(' ', '').split(',').includes(flag);
};

/**
 * Get the list of enabled flags.
 *
 * @return {Array} List of enabled flags.
 */
const getFlags = () => {
  const flags = getSetting('override-flags');
  if (! flags) {
    return [];
  }

  return flags.toLowerCase().replaceAll(' ', '').split(',');
};

export {
  getFlag,
  getFlags
};
