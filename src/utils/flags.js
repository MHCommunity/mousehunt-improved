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
  return flags.replaceAll(' ', '').split(',').includes(flag);
};

export {
  getFlag
};
