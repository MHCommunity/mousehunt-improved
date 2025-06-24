import { getData, sessionGet, sessionSet } from './data';
import { onNavigation, onTravel } from './events';
import { debuglog } from './debug';
import { getCurrentPage } from './page';
import { getFlag } from './flags';

/**
 * Check to make sure we have the required global functions we need.
 *
 * @return {boolean} Whether we have the required functions.
 */
const isApp = () => {
  return (
    typeof app !== 'undefined' &&
		typeof user !== 'undefined' &&
		typeof hg !== 'undefined' &&
		typeof eventRegistry !== 'undefined'
  );
};

/**
 * Check if the current page is an image.
 *
 * @param {string} path The path to check.
 *
 * @return {boolean} Whether we're in an image.
 */
const isUnsupportedFile = (path = false) => {
  path = path || window.location.pathname;

  // Don't load on the puzzle image page.
  if ('puzzleimage.php' === path) {
    return true;
  }

  return path.match(/\.(jpeg|jpg|gif|png|svg|json|css|js)$/i);
};

/**
 * Check if we're in an iframe.
 *
 * @return {boolean} Whether we're in an iframe.
 */
const isiFrame = () => {
  return window.self !== window.top;
};

/**
 * Check if the legacy HUD is enabled.
 *
 * @return {boolean} Whether the legacy HUD is enabled.
 */
const isLegacyHUD = () => {
  return getFlag('legacy-hud') || hg?.utils?.PageUtil?.isLegacy?.();
};

/**
 * Check if the user is logged in.
 *
 * @return {boolean} True if the user is logged in, false otherwise.
 */
const isLoggedIn = () => {
  return user && user.user_id && 'login' !== getCurrentPage();
};

/**
 * Check if dark mode is enabled.
 *
 * @return {boolean} True if dark mode is enabled, false otherwise.
 */
const isDarkMode = () => {
  return !! getComputedStyle(document.documentElement).getPropertyValue('--mhdm-white');
};

/**
 * Check for MHCT.
 *
 * @return {boolean} Whether MHCT is installed or not.
 */
const isMHCT = () => {
  return !! document.querySelector('#mhhh_version');
};

/**
 * Check if the overlay is visible.
 *
 * @return {boolean} True if the overlay is visible, false otherwise.
 */
const isOverlayVisible = () => {
  return typeof activejsDialog !== 'undefined' && activejsDialog?.isVisible();
};

const bodyClasses = { added: [], removed: [] };
/**
 * Add a body class that persists across navigation.
 *
 * @param {string}  className Class to add.
 * @param {boolean} force     Whether to force the class to be added.
 */
const addBodyClass = (className, force = false) => {
  if (
    bodyClasses.removed.includes(className) ||
    bodyClasses.added.includes(className)
  ) {
    if (force) {
      bodyClasses.added.push(className);
      document.body.classList.add(className);
    }

    return;
  }

  bodyClasses.added.push(className);

  /**
   * Helper function to add the class to the body.
   */
  const addClass = () => {
    document.body.classList.add(className);
  };

  addClass();
  onNavigation(addClass);
  onTravel(null, {
    /**
     * Callback to add the class after travel.
     */
    callback: () => {
      setTimeout(addClass, 500);
    },
  });
};

/**
 * Remove a body class that persists across navigation.
 *
 * @param {string} className Class to remove.
 */
const removeBodyClass = (className) => {
  bodyClasses.added = bodyClasses.added.filter((c) => c !== className);
  bodyClasses.removed.push(className);
  document.body.classList.remove(className);
};

/**
 * Remove a body class by prefix, useful for removing all classes that start with a certain string.
 *
 * @param {string} prefix The prefix to remove.
 */
const removeBodyClassByPrefix = (prefix) => {
  bodyClasses.added = bodyClasses.added.filter((c) => ! c.startsWith(prefix));
  bodyClasses.removed.push(prefix);
  document.body.className = document.body.className
    .split(' ')
    .filter((c) => ! c.startsWith(prefix))
    .join(' ');
};

/**
 * Get the tradable items.
 *
 * @param {string} valueKey Which key to use for the value. 'all' will return the entire object.
 *
 * @return {Array} Array of tradable items.
 */
const getTradableItems = async (valueKey = 'all') => {
  const tradableItems = await getData('items-tradable');
  tradableItems.sort((a, b) => a.name.localeCompare(b.name));

  if ('all' === valueKey) {
    return tradableItems;
  }

  return tradableItems.map((item) => ({
    name: item.name,
    value: item[valueKey],
  }));
};

const requests = {};
let lastRequest = 0;
/**
 * POST a request to the server and return the response.
 *
 * @async
 * @param {string}  url        The url to post to, not including the base url.
 * @param {Object}  formData   The form data to post.
 * @param {boolean} skipChecks Whether to skip the checks for an existing request.
 * @param {Object}  skipOpts   Options to skip certain form data.
 *
 * @return {Promise} The response.
 */
const doRequest = async (url, formData = {}, skipChecks = false, skipOpts = {}) => {
  if (getFlag('disable-requests')) {
    return;
  }

  if (! isLoggedIn()) {
    return;
  }

  // If we don't have the needed params, bail.
  if ('undefined' === typeof lastReadJournalEntryId || 'undefined' === typeof user) {
    return;
  }

  // If our needed params are empty, bail.
  if (! lastReadJournalEntryId || ! user || ! user?.unique_hash) {
    return;
  }

  // Make sure we don't make too many requests by waiting a bit if we just made one.
  const now = Date.now();
  if (now - lastRequest < 100) {
    await sleep(100 - (now - lastRequest));

    lastRequest = Date.now();
  }

  const requestKey = Object.keys(formData).length ? `${url}-${JSON.stringify(formData)}` : url;
  const timeRequested = Date.now();
  if (requests[requestKey] && ! skipChecks) {
    debuglog('utils-data', `Request already in progress: ${requestKey}`);

    if (requests[requestKey].in_progress) {
      return new Promise((resolve) => {
        const timeout = setTimeout(async () => {
          debuglog('utils-data', `Request timed out: ${requestKey}, starting new request`);

          clearInterval(interval);
          const newRequest = await doRequest(url, formData, true);
          resolve(newRequest);
        }, 2500);

        const interval = setInterval(() => {
          debuglog('utils-data', `Checking if request is complete: ${requestKey}`);

          if (! requests[requestKey].in_progress) {
            debuglog('utils-data', `Returning saved response: ${requestKey}`);

            clearInterval(interval);
            clearTimeout(timeout);
            resolve(requests[requestKey].response);
          }
        }, 100);
      });
    } else if (requests[requestKey].time_requested > (timeRequested - 350)) {
      debuglog('utils-data', `Request already completed: ${requestKey}`);
      return requests[requestKey].response;
    }
  }

  debuglog('utils-data', `Starting request: ${requestKey}`);

  requests[requestKey] = {
    in_progress: true,
    time_requested: timeRequested,
  };

  // Build the form for the request.
  const form = new FormData();
  if (! skipOpts.skipSn && ! skipOpts.skipAll) {
    form.append('sn', 'Hitgrab');
  }

  if (! skipOpts.skipHgIsAjax && ! skipOpts.skipAll) {
    form.append('hg_is_ajax', 1);
  }

  if (! skipOpts.skipLastReadJournalEntryId && ! skipOpts.skipAll) {
    form.append('last_read_journal_entry_id', lastReadJournalEntryId ?? 0);
  }

  if (! skipOpts.skipUh && ! skipOpts.skipAll) {
    form.append('uh', user?.unique_hash ?? '');
  }

  // Add in the passed in form data.
  Object.keys(formData).forEach((key) => form.append(key, formData[key]));

  // Convert the form to a URL encoded string for the body.
  const requestBody = new URLSearchParams(form).toString();

  try {
    response = await fetch(callbackurl ? `${callbackurl}${url}` : `https://www.mousehuntgame.com/${url}`, {
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-By': `MouseHunt-Improved/${mhImprovedVersion}`,
      },
    });
  } catch (error) {
    console.error(`Error fetching ${url}:`, error); // eslint-disable-line no-console

    return false;
  }

  // Wait for the response and return it.
  let data;

  try {
    data = await (skipOpts.skipJson ? response.text() : response.json());
  } catch (error) {
    console.error(`Error parsing response for ${url}:`, error, url, formData, response); // eslint-disable-line no-console

    return false;
  }

  // Store the request in the requests object.
  requests[requestKey] = {
    time_requested: timeRequested,
    response: data,
  };

  return data;
};

/**
 * Sleep for a given number of milliseconds.
 *
 * @param {number} ms      The number of milliseconds to sleep.
 * @param {number} elapsed The time already elapsed.
 *
 * @return {Promise} A promise that resolves after the sleep.
 */
const sleep = async (ms, elapsed = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms - elapsed));
};

/**
 * Return true if platform is MacOS.
 *
 * Props @wordpress/keycodes.
 *
 * @param {Window?} _window Window object by default; used for DI testing.
 *
 * @return {boolean} True if MacOS; false otherwise.
 */
function isAppleOS(_window = null) {
  if (! _window) {
    if (typeof window === 'undefined') {
      return false;
    }

    _window = window;
  }

  const { platform } = _window.navigator;

  return platform.includes('Mac') || ['iPad', 'iPhone'].includes(platform);
}

/**
 * Check if the user has the mini CRE.
 *
 * @return {boolean} True if the user has the mini CRE; false otherwise.
 */
const hasMiniCRE = () => {
  if (sessionGet('has-mini-cre')) {
    return true;
  }

  if ('camp' !== getCurrentPage()) {
    return;
  }

  const cre = document.querySelector('.min-luck-button');
  sessionSet('has-mini-cre', !! cre);

  return !! cre;
};

/**
 * Uppercase the first letter of a string.
 *
 * @param {string} string The string to uppercase.
 *
 * @return {string} The string with the first letter uppercased.
 */
const uppercaseFirstLetter = (string) => {
  string = string.length ? string : ' ';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Set multiple timeouts.
 *
 * @param {Function}     fn The function to run.
 * @param {Array|number} ms The milliseconds to wait.
 */
const setMultipleTimeout = (fn, ms) => {
  (Array.isArray(ms) ? ms : [ms]).forEach((time) => setTimeout(fn, time));
};

/**
 * Refresh the page after a delay.
 *
 * @param {number} delay The delay before refreshing the page.
 */
const refreshPage = (delay = 0) => {
  setTimeout(() => {
    window.location.reload();
  }, delay);
};

/**
 * Debounce a function.
 *
 * @param {Function} func  The function to debounce.
 * @param {number}   delay The delay to debounce by.
 *
 * @return {Function} The debounced function.
 */
const debounce = (func, delay = 100) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if the version is higher.
 *
 * @param {string} version1 The first version.
 * @param {string} version2 The second version.
 *
 * @return {boolean} True if version1 is higher than version2; false otherwise.
 */
function isVersionHigher(version1, version2) {
  const version1Parts = version1.split('.').map(Number);
  const version2Parts = version2.split('.').map(Number);

  for (const [i, version1Part] of version1Parts.entries()) {
    if (version1Part > version2Parts[i]) {
      return true;
    } else if (version1Part < version2Parts[i]) {
      return false;
    }
  }

  return false;
}

export {
  doRequest,
  getTradableItems,
  isApp,
  isiFrame,
  isUnsupportedFile,
  isLegacyHUD,
  isLoggedIn,
  isDarkMode,
  isMHCT,
  isOverlayVisible,
  addBodyClass,
  removeBodyClass,
  removeBodyClassByPrefix,
  isAppleOS,
  hasMiniCRE,
  sleep,
  uppercaseFirstLetter,
  setMultipleTimeout,
  refreshPage,
  debounce,
  isVersionHigher
};
