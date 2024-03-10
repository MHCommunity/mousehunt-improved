import { getSetting } from './settings';

/**
 * Check if the given flag is enabled.
 *
 * @param {string} flag Flag to check.
 *
 * @return {boolean} Whether the flag is enabled.
 */
const getFlag = (flag) => {
  return getSetting(`experiments.${flag}`, getFlags().includes(flag));
};

/**
 * Get the list of enabled flags.
 *
 * @return {Array} List of enabled flags.
 */
const getFlags = () => {
  return getSetting('override-flags', '').toLowerCase().replaceAll(' ', '').split(',');
};

export {
  getFlag,
  getFlags
};
