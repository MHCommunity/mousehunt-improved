import { getGlobal } from './global';
import { getSetting } from './settings';

/**
 * Helper function to determine if debug logs should be displayed.
 *
 * @param {string} context The context to check for debug settings.
 * @return {boolean} Whether debug logs should be displayed.
 */
const shouldLogDebug = (context) => {
  if (! getSetting('debug', false)) {
    return false;
  }

  return getSetting('debug.all', false) ||
    getSetting(`debug.${context}`, false) ||
    getGlobal('mh-improved-updating') ||
    getGlobal('mh-improved-debug');
};

/**
 * Helper function to log a debug message.
 *
 * @param {string} message Message to log.
 * @param {any}    args    Additional arguments to log.
 */
const debug = (message, ...args) => {
  if (shouldLogDebug('module')) {
    // eslint-disable-next-line no-console
    console.log(
      `%cMH Improved%c: ${message}`,
      'color: #90588c; font-weight: 900',
      'color: inherit; font-weight: inherit',
      ...args
    );
  }
};

/**
 * Helper function to log a debug message.
 *
 * @param {string} module  Module name.
 * @param {string} message Message to log.
 * @param {any}    args    Additional arguments to log.
 */
const debuglog = (module, message, ...args) => {
  if (shouldLogDebug(module)) {
    // eslint-disable-next-line no-console
    console.log(
      `%cMH Improved %c${module}%c ${message}`,
      'color: #90588c; font-weight: 900',
      'color: #90588c; font-weight: 400',
      'color: inherit; font-weight: inherit',
      ...args
    );
  }
};

export {
  debug,
  debuglog
};
