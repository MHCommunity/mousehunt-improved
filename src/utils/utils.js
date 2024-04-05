import { getData, sessionGet, sessionSet } from './data';
import { onNavigation, onTravel } from './events';
import { debuglog } from './debug';
import { getCurrentPage } from './page';

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
  if (! hg?.utils?.PageUtil?.isLegacy) {
    return false;
  }

  return hg.utils.PageUtil.isLegacy();
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
 * Check if the overlay is visible.
 *
 * @return {boolean} True if the overlay is visible, false otherwise.
 */
const isOverlayVisible = () => {
  return activejsDialog && activejsDialog.isVisible();
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
    ! force && (
      bodyClasses.removed.includes(className) ||
      bodyClasses.added.includes(className)
    )
  ) {
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
 * Get the tradable items.
 *
 * @param {string} valueKey Which key to use for the value. 'all' will return the entire object.
 *
 * @return {Array} Array of tradable items.
 */
const getTradableItems = async (valueKey = 'all') => {
  const tradableItems = await getData('items-tradable');

  // sort the items by name
  tradableItems.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  if ('all' === valueKey) {
    return tradableItems;
  }

  const returnItems = [];
  for (const item of tradableItems) {
    returnItems.push({
      name: item.name,
      value: item[valueKey],
    });
  }

  return returnItems;
};

const requests = {};
/**
 * POST a request to the server and return the response.
 *
 * @async
 * @param {string}  url        The url to post to, not including the base url.
 * @param {Object}  formData   The form data to post.
 * @param {boolean} skipChecks Whether to skip the checks for an existing request.
 *
 * @return {Promise} The response.
 */
const doRequest = async (url, formData = {}, skipChecks = false) => {
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

  const requestKey = Object.keys(formData).length ? `${url}-${JSON.stringify(formData)}` : url;
  const timeRequested = Date.now();
  debuglog('utils-data', `Making request: ${requestKey} at ${timeRequested}`);

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
  form.append('sn', 'Hitgrab');
  form.append('hg_is_ajax', 1);
  form.append('last_read_journal_entry_id', lastReadJournalEntryId ?? 0);
  form.append('uh', user?.unique_hash ?? '');

  // Add in the passed in form data.
  for (const key in formData) {
    form.append(key, formData[key]);
  }

  // Convert the form to a URL encoded string for the body.
  const requestBody = new URLSearchParams(form).toString();

  // Send the request.
  let response;
  let attempts = 0;

  while (! response && attempts < 3) {
    try {
      response = await fetch(
        callbackurl ? callbackurl + url : 'https://www.mousehuntgame.com/' + url,
        {
          method: 'POST',
          body: requestBody,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed. Retrying...`, error); // eslint-disable-line no-console
    }
  }

  if (attempts >= 3) {
    console.error('Failed to fetch after maximum attempts'); // eslint-disable-line no-console
  }

  // Wait for the response and return it.
  let data;

  try {
    data = await response.json();
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
  if (elapsed) {
    ms -= elapsed;
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Return true if platform is MacOS. Props @wordpress/keycodes, thanks!
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
  const hasMiniCre = sessionGet('has-mini-cre');
  if (hasMiniCre) {
    return true;
  }

  if ('camp' !== getCurrentPage()) {
    return;
  }

  const cre = document.querySelector('.min-luck-button');
  if (! cre) {
    sessionSet('has-mini-cre', false);
    return false;
  }

  sessionSet('has-mini-cre', true);

  return true;
};

/**
 * Uppercase the first letter of a string.
 *
 * @param {string} string The string to uppercase.
 *
 * @return {string} The string with the first letter uppercased.
 */
const uppercaseFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Set multiple timeouts.
 *
 * @param {Function}     fn The function to run.
 * @param {Array|number} ms The milliseconds to wait.
 */
const setMultipleTimeout = (fn, ms) => {
  // If ms isn't an array, make it one.
  if (! Array.isArray(ms)) {
    ms = [ms];
  }

  ms.forEach((time) => {
    setTimeout(fn, time);
  });
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

export {
  doRequest,
  getTradableItems,
  isApp,
  isiFrame,
  isUnsupportedFile,
  isLegacyHUD,
  isLoggedIn,
  isOverlayVisible,
  addBodyClass,
  removeBodyClass,
  isAppleOS,
  hasMiniCRE,
  sleep,
  uppercaseFirstLetter,
  setMultipleTimeout,
  refreshPage
};
