import { getFlag } from './flags';
/**
 * Helper function to log a debug message.
 *
 * @param {string} message Message to log.
 * @param {any}    args    Additional arguments to log.
 */
const debug = (message, ...args) => {
  if (getFlag('debug')) {
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
 * @param {string} message Message to log.
 * @param {any}    args    Additional arguments to log.
 */
const debuglite = (message, ...args) => {
  if (getFlag('debug')) {
    // eslint-disable-next-line no-console
    console.log(
      `%c   MH Improved%c: ${message}`,
      'color: #90588c',
      'color: inherit',
      ...args
    );
  }
};

const devDebug = (message, ...args) => {
  // eslint-disable-next-line no-console
  console.log(
    `%cMH Improved%c: ${message}`,
    'color: #ff3434; font-weight: 900',
    'color: inherit; font-weight: inherit',
    ...args
  );
};

export {
  debug,
  debuglite,
  devDebug
};
