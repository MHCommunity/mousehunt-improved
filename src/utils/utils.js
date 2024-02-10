import { getData, sessionGet, sessionSet } from './data';
import { onNavigation, onTravel } from './events';
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
  return hg.utils.PageUtil.isLegacy();
};

/**
 * Check if the user is logged in.
 *
 * @return {boolean} True if the user is logged in, false otherwise.
 */
const isLoggedIn = () => {
  return user.length > 0 && 'login' !== getCurrentPage();
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
 * @param {string} className Class to add.
 */
const addBodyClass = (className) => {
  if (
    bodyClasses.removed.includes(className) ||
    bodyClasses.added.includes(className)
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

const removeBodyClass = (className) => {
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

/**
 * POST a request to the server and return the response.
 *
 * @async
 * @param {string} url      The url to post to, not including the base url.
 * @param {Object} formData The form data to post.
 *
 * @return {Promise} The response.
 */
const doRequest = async (url, formData = {}) => {
  // If we don't have the needed params, bail.
  if ('undefined' === typeof lastReadJournalEntryId || 'undefined' === typeof user) {
    return;
  }

  // If our needed params are empty, bail.
  if (! lastReadJournalEntryId || ! user || ! user.unique_hash) {
    return;
  }

  // Build the form for the request.
  const form = new FormData();
  form.append('sn', 'Hitgrab');
  form.append('hg_is_ajax', 1);
  form.append('last_read_journal_entry_id', lastReadJournalEntryId ?? 0);
  form.append('uh', user.unique_hash ?? '');

  // Add in the passed in form data.
  for (const key in formData) {
    form.append(key, formData[key]);
  }

  // Convert the form to a URL encoded string for the body.
  const requestBody = new URLSearchParams(form).toString();

  // Send the request.
  const response = await fetch(
    callbackurl ? callbackurl + url : 'https://www.mousehuntgame.com/' + url,
    {
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  // Wait for the response and return it.
  const data = await response.json();
  return data;
};

/**
 * Sleep for a given number of milliseconds.
 *
 * @param {number} ms The number of milliseconds to sleep.
 *
 * @return {Promise} A promise that resolves after the sleep.
 */
const sleep = async (ms) => {
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

  const cre = document.querySelector('.min-luck-container[style="position: absolute; top: 7px; right: 7px;"]');
  if (! cre) {
    sessionSet('has-mini-cre', false);
    return false;
  }

  sessionSet('has-mini-cre', true);

  return true;
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
  sleep
};
