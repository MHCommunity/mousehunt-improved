import { getCurrentSubtab, getCurrentTab, isCurrentPage } from './page';
import { getCurrentLocation } from './location-current';
import { getCurrentPage } from './page-current';
import { onEvent } from './event-registry';
import { prepareLifecycleCallback } from './lifecycle';
import { showHornMessage } from './horn';

const requestCallbacks = {};
let onRequestHolder = false;

/**
 * Normalize a request URL for matching.
 *
 * @param {string|null} url The URL to normalize.
 *
 * @return {string} The normalized URL.
 */
const normalizeRequestUrl = (url = null) => {
  if (! url || '*' === url) {
    return '*';
  }

  if (url.startsWith('http') || url.startsWith('managers/ajax/')) {
    return url;
  }

  return `managers/ajax/${url}`;
};

/**
 * Check whether a request URL should be ignored.
 *
 * @param {string} responseUrl The response URL.
 * @param {Array}  ignore      URLs to ignore.
 *
 * @return {boolean} Whether the request should be ignored.
 */
const shouldIgnoreRequest = (responseUrl, ignore = []) => {
  return ignore.some((ignoredUrl) => {
    const normalizedIgnoredUrl = normalizeRequestUrl(ignoredUrl);
    return '*' === normalizedIgnoredUrl || responseUrl.includes(normalizedIgnoredUrl);
  });
};

/**
 * Do something when ajax requests are completed.
 *
 * @since 1.0.0
 *
 * @example
 * ```js
 * // Run on spcific urls.
 * onRequest((response) => {
 *  console.log(response);
 * }, 'turns/activeturn.php');
 * ```
 *
 *
 * @example
 * ```js
 * // Run on all urls.
 * onRequest((response) => {
 *   console.log(response);
 * });
 * ```
 *
 * @param {string}   url         The url to match. If not provided, all ajax requests will be matched. /managers/ajax/ is already prepended.
 * @param {Function} callback    The callback to call when an ajax request is completed.
 * @param {boolean}  skipSuccess Skip the success check.
 * @param {Array}    ignore      The urls to ignore.
 * @param {boolean}  priority    Whether or not to run the callback first.
 */
const onRequest = (url = null, callback = null, skipSuccess = false, ignore = [], priority = false) => {
  if (! onRequestHolder) {
    const req = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
      this.addEventListener('load', function () {
        if (this.responseText) {
          let response = {};
          try {
            response = JSON.parse(this.responseText);
          } catch {
            return;
          }

          Object.keys(requestCallbacks).forEach((key) => {
            if ('*' === key || this.responseURL.includes(key)) {
              requestCallbacks[key].forEach((item) => {
                if (shouldIgnoreRequest(this.responseURL, item.ignore)) {
                  return;
                }

                if (item.callback && typeof item.callback === 'function' && (item.skipSuccess || response?.success)) {
                  item.callback(response, this._data);
                }
              });
            }
          });
        }
      });

      Reflect.apply(req, this, arguments);
    };

    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (data) {
      if (data) {
        const params = new URLSearchParams(data);
        this._data = Object.fromEntries(params);
      } else {
        this._data = {};
      }

      return Reflect.apply(send, this, arguments);
    };

    onRequestHolder = true;
  }

  url = normalizeRequestUrl(url);

  if (! callback) {
    return;
  }

  const lifecycleCallback = prepareLifecycleCallback(callback, `request:${url}`);
  if (lifecycleCallback.skip) {
    return;
  }

  callback = lifecycleCallback.callback;

  if (! requestCallbacks[url]) {
    requestCallbacks[url] = [];
  }

  if (priority) {
    requestCallbacks[url].unshift({
      callback,
      skipSuccess,
      ignore,
    });
  } else {
    requestCallbacks[url].push({
      callback,
      skipSuccess,
      ignore,
    });
  }
};

/**
 * Run the callbacks depending on visibility.
 *
 * @since 1.0.0
 *
 * @ignore
 *
 * @param {Object} settings   Settings object.
 * @param {Node}   parentNode The parent node.
 * @param {Object} callbacks  The callbacks to run.
 *
 * @return {Object} The settings.
 */
const runCallbacks = (settings, parentNode, callbacks) => {
  // Loop through the keys on our settings object.
  Object.keys(settings).forEach((key) => {
    // If the parentNode that's passed in contains the selector for the key.
    if (parentNode && parentNode.classList && parentNode.classList.contains(settings[key].selector)) {
      // Set as visible.
      settings[key].isVisible = true;

      // If there is a show callback, run it.
      if (callbacks[key] && callbacks[key].show) {
        callbacks[key].show();
      }
    } else if (settings[key].isVisible) {
      // Mark as not visible.
      settings[key].isVisible = false;

      // If there is a hide callback, run it.
      if (callbacks[key] && callbacks[key].hide) {
        callbacks[key].hide();
      }
    }
  });

  return settings;
};

let overlayMutationObserver = null;
const overlayCallbacks = [];
/**
 * Do something when the overlay is shown or hidden.
 *
 * @param {Object}   callbacks        Callbacks object.
 * @param {Function} callbacks.show   The callback to call when the overlay is shown.
 * @param {Function} callbacks.hide   The callback to call when the overlay is hidden.
 * @param {Function} callbacks.change The callback to call when the overlay is changed.
 */
const onOverlayChange = (callbacks) => {
  // TODO: rewrite this.
  // Track the different overlay states.
  let overlayData = {
    item: { isVisible: false, selector: 'itemViewPopup' },
    mouse: { isVisible: false, selector: 'mouseViewPopup' },
    marketplace: { isVisible: false, selector: 'marketplaceViewPopup' },
  };

  overlayCallbacks.push(callbacks);

  if (overlayMutationObserver) {
    return;
  }

  overlayMutationObserver = true;

  // Observe the overlayPopup element for changes.
  const observer = new MutationObserver(() => {
    overlayCallbacks.forEach((callback) => {
      if (callback.change) {
        callback.change();
      }

      // Grab the overlayPopup element and make sure it has classes on it.
      const overlayType = document.querySelector('#overlayPopup');
      if (overlayType && overlayType.classList.length <= 0) {
        return;
      }

      // Grab the overlayBg and check if it is visible or not.
      const overlayBg = document.querySelector('#overlayBg');
      if (overlayBg && overlayBg.classList.length > 0) {
        // If there's a show callback, run it.
        if (callback.show) {
          callback.show();
        }
      } else if (callback.hide) {
        // If there's a hide callback, run it.
        callback.hide();
      }

      // Run all the specific callbacks.
      overlayData = runCallbacks(overlayData, overlayType, callback);
    });
  });

  // Observe the overlayPopup element for changes.
  const observeTarget = document.querySelector('#overlayPopup');
  if (observeTarget) {
    observer.observe(observeTarget, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
};

/**
 * Get the dialog mapping.
 *
 * @return {Object} The dialog mapping.
 */
const getDialogMapping = () => {
  return {
    treasureMapPopup: 'map',
    itemViewPopup: 'item',
    mouseViewPopup: 'mouse',
    largerImage: 'image',
    convertibleOpenViewPopup: 'convertible',
    adventureBookPopup: 'adventureBook',
    marketplaceViewPopup: 'marketplace',
    giftSelectorViewPopup: 'gifts',
    supportPageContactUsForm: 'support',
    MHCheckout: 'premiumShop',
  };
};

/**
 * When the dialog is shown, run the callback.
 *
 * @param {string}   overlay  The overlay to check for.
 * @param {Function} callback The callback to run.
 * @param {boolean}  once     Whether or not to remove the event listener after it's fired.
 */
const onDialogShow = (overlay = null, callback = null, once = false) => {
  if (! window.eventRegistry) {
    return;
  }

  const lifecycleCallback = prepareLifecycleCallback(callback, `dialog-show:${overlay}`);
  if (lifecycleCallback.skip) {
    return;
  }

  // TODO: rewrite this.
  // make a unique identifier for the event listener based on the callback.
  const identifier = (lifecycleCallback.id || callback.toString()).replaceAll(/[^\w-]/gi, '');
  eventRegistry.addEventListener('js_dialog_show', () => {
    if (! activejsDialog) {
      return;
    }

    // Get all the tokens and check the content.
    const tokens = activejsDialog.getAllTokens();

    // Make sure we have the 'content' key.
    // For item and mouse views, the entire event fires twice, once while loading and
    // once when the content is loaded. We only want to run this once, so we check if
    // the content is empty in a weird way.
    if (
      ! tokens ||
      ! tokens['{*content*}'] ||
      ! tokens['{*content*}'].value ||
      tokens['{*content*}'].value === '' ||
      tokens['{*content*}'].value.includes('data-item-type=""') || // Item view.
      tokens['{*content*}'].value.includes('data-mouse-id=""') // Mouse view.
    ) {
      return;
    }

    // Grab the attributes of the dialog to determine the type.
    const atts = activejsDialog.getAttributes();
    let dialogType = atts.className
      .replace('jsDialogFixed', '')
      .replace('wide', '')
      .replace('default', '')
      .replaceAll('  ', ' ')
      .replaceAll(' ', '.')
      .trim();

    // Remove any leading or trailing periods left over from removed classes.
    dialogType = dialogType.replaceAll(/^\.+|\.+$/g, '');

    window.mhutils = window.mhutils ? { ...window.mhutils, lastDialog: { overlay: dialogType } } : { lastDialog: { overlay: dialogType } };
    lastDialog = dialogType;

    if ((! overlay || 'all' === overlay) && 'function' === typeof callback) {
      return lifecycleCallback.callback();
    }

    const dialogMapping = getDialogMapping();

    // Match the full dialog type, its mapped name, or any single class of a
    // compound type, so 'floatingIslandsWorkshop' matches a dialog type like
    // 'floatingIslandsWorkshop.floatingIslandsDialog'.
    const isMatch = overlay === dialogType ||
      overlay === dialogMapping[dialogType] ||
      dialogType.split('.').some((part) => part === overlay || dialogMapping[part] === overlay);

    if ('function' === typeof callback && isMatch) {
      return lifecycleCallback.callback();
    }
  }, null, once, 0, identifier);
};

const dialogHideCallbacks = [];
let lastDialog = null;
let hasAddedDialogHideListener = false;

/**
 * Normalize a dialog overlay name for matching.
 *
 * @param {string|null} overlay The overlay to normalize.
 *
 * @return {string} The normalized overlay name.
 */
const normalizeDialogOverlay = (overlay = null) => {
  if (! overlay || 'all' === overlay) {
    return 'all';
  }

  const dialogMapping = getDialogMapping();

  if (overlay in dialogMapping) {
    return dialogMapping[overlay];
  }

  return overlay;
};
/**
 * When the dialog is hidden, run the callback.
 *
 * @param {Function} callback The callback to run.
 * @param {string}   overlay  The overlay to check for.
 */
const onDialogHide = (callback, overlay = null) => {
  if (! window.eventRegistry) {
    return;
  }

  const normalizedOverlay = normalizeDialogOverlay(overlay);
  const lifecycleCallback = prepareLifecycleCallback(callback, `dialog-hide:${normalizedOverlay}`);
  if (lifecycleCallback.skip) {
    return;
  }

  callback = lifecycleCallback.callback;

  if (! dialogHideCallbacks.some((item) => item.callback === callback && item.overlay === normalizedOverlay)) {
    dialogHideCallbacks.push({
      overlay: normalizedOverlay,
      callback,
    });
  }

  if (hasAddedDialogHideListener) {
    return;
  }

  eventRegistry.addEventListener('js_dialog_hide', () => {
    if (! lastDialog) {
      return;
    }

    dialogHideCallbacks.forEach((item) => {
      if (lastDialog === item.overlay || 'all' === item.overlay) {
        item.callback();
      }
    });

    lastDialog = null;
  });

  hasAddedDialogHideListener = true;
};

const pageChangeCallbacks = [];
let pageChangeObserver = null;
/**
 * Do something when the page or tab changes.
 *
 * @param {Object}   callbacks        Callbacks object.
 * @param {Function} callbacks.show   The callback to call when the page is navigated to.
 * @param {Function} callbacks.hide   The callback to call when the page is navigated away from.
 * @param {Function} callbacks.change The callback to call when the page is changed.
 */
const onPageChange = (callbacks) => {
  // Track our page tab states.
  let tabData = {
    travel: { isVisible: false, selector: 'PageTravel' },
  };

  pageChangeCallbacks.push(callbacks);

  if (pageChangeObserver) {
    return;
  }

  pageChangeObserver = true;

  // Observe the mousehuntContainer element for changes.
  const observer = new MutationObserver(() => {
    pageChangeCallbacks.forEach((callback) => {
      // If there's a change callback, run it.
      if (callback.change) {
        callback.change();
      }

      // Grab the container element and make sure it has classes on it.
      const mhContainer = document.querySelector('#mousehuntContainer');
      if (mhContainer && mhContainer.classList.length > 0) {
        // Run the callbacks.
        tabData = runCallbacks(tabData, mhContainer, callback);
      }
    });
  });

  // Observe the mousehuntContainer element for changes.
  const observeTarget = document.querySelector('#mousehuntContainer');
  if (observeTarget) {
    observer.observe(observeTarget, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
};

/**
 * Do something when the user travels to a location.
 *
 * @param {string}   location                    The location traveled to.
 * @param {Object}   [options]                   The options.
 * @param {boolean}  [options.shouldAddReminder] Whether or not to add a reminder.
 * @param {string}   [options.title]             The title of the reminder.
 * @param {string}   [options.text]              The text of the reminder.
 * @param {string}   [options.button]            The button text of the reminder.
 * @param {string}   [options.action]            The action to take when the button is clicked.
 * @param {Function} [options.callback]          The callback to run when the user is at the location.
 */
const onTravel = (location, options) => {
  if (! window.eventRegistry) {
    return;
  }

  const callback = () => onTravelCallback(location, options);
  const lifecycleCallback = prepareLifecycleCallback(callback, `travel:${location || '*'}`);
  if (lifecycleCallback.skip) {
    return;
  }

  eventRegistry.addEventListener('travel_complete', lifecycleCallback.callback);
};

/**
 * Do something when the user travels to a location.
 * This is a callback for the onTravel function.
 *
 * @param {string}   location                    The location traveled to.
 * @param {Object}   [options]                   The options.
 * @param {boolean}  [options.shouldAddReminder] Whether or not to add a reminder.
 * @param {string}   [options.title]             The title of the reminder.
 * @param {string}   [options.text]              The text of the reminder.
 * @param {string}   [options.button]            The button text of the reminder.
 * @param {string}   [options.action]            The action to take when the button is clicked.
 * @param {Function} [options.callback]          The callback to run when the user is at the location.
 */
const onTravelCallback = (location, options) => {
  if (location && location !== getCurrentLocation()) {
    return;
  }

  if (options?.shouldAddReminder) {
    showHornMessage({
      title: options.title || '',
      text: options.text || '',
      button: options.button || 'Dismiss',
      action: options.action || null,
    });
  }

  if (options.callback) {
    options.callback();
  }
};

const callbacks = [];
let hasAddedNavigationListener = false;

/**
 * Do something when the user navigates to a page, optionally checking the tab and subtab.
 *
 * @param {Function} callback            The callback to run when the user navigates to the page.
 * @param {Object}   [options]           The options.
 * @param {string}   [options.page]      The page to watch for.
 * @param {string}   [options.tab]       The tab to watch for.
 * @param {string}   [options.subtab]    The subtab to watch for.
 * @param {boolean}  [options.anyTab]    Whether or not to run the callback on any tab.
 * @param {boolean}  [options.anySubtab] Whether or not to run the callback on any subtab.
 * @param {boolean}  [options.onLoad]    Whether or not to run the callback on load.
 *
 * @example
 * ```
 * onNavigation(() => console.log('mouse stats by location'), {
 *   page: 'adversaries',
 *   tab: 'your_stats',
 *   subtab: 'location'
 * });
 *
 * onNavigation(() => console.log('friend request page'), {
 *   page: 'friends',
 *   tab: 'requests'
 * });
 *
 * onNavigation(() => console.log('hunter profile, but not when refreshing the page'), {
 *   page: 'hunterprofile',
 *   onLoad: true
 * });
 *```
 */
const onNavigation = (callback, options = {}) => {
  const defaults = {
    page: false,
    tab: false,
    subtab: false,
    onLoad: true,
    anyTab: false,
    anySubtab: false,
  };

  // merge the defaults with the options
  const { page, tab, subtab, onLoad, anyTab, anySubtab } = Object.assign(defaults, options);

  // If we don't pass in a page, then we want to run the callback on every page.
  const bypassMatch = ! page;

  // We do this once on load in case we are starting on the page we want to watch for.
  if (
    onLoad && (
      bypassMatch ||
      isCurrentPage(
        page,
        anyTab ? getCurrentTab() : tab,
        anySubtab ? getCurrentSubtab() : subtab
      )
    )
  ) {
    callback();
  }

  const lifecycleCallback = prepareLifecycleCallback(callback, `navigation:${page || '*'}:${tab || '*'}:${subtab || '*'}`);
  if (lifecycleCallback.skip) {
    return;
  }

  callbacks.push({ callback: lifecycleCallback.callback, page, tab, subtab, bypassMatch });

  if (! hasAddedNavigationListener) {
    addNavigationListeners();
    hasAddedNavigationListener = true;
  }
};

/**
 * Add the navigation listeners.
 */
const addNavigationListeners = () => {
  if (! window.eventRegistry) {
    return;
  }

  eventRegistry.addEventListener('set_page', (e) => {
    const tabs = e?.data?.tabs || {};

    const currentTab = Object.keys(tabs).find((key) => tabs[key].is_active_tab);
    const forceCurrentTab = currentTab?.type;

    callbacks.forEach(({ callback, page, tab, subtab, bypassMatch }) => {
      if (bypassMatch) {
        callback();
        return;
      }

      if (! subtab) {
        if (isCurrentPage(page, tab, false, getCurrentPage(), forceCurrentTab)) {
          callback();
        }

        return;
      }

      if (currentTab?.subtabs && currentTab?.subtabs.length > 0) {
        const forceSubtab = currentTab.subtabs.find((searchTab) => searchTab.is_active_subtab).subtab_type;

        if (isCurrentPage(page, tab, subtab, getCurrentPage(), forceCurrentTab, forceSubtab)) {
          callback();
        }
      }
    });
  });

  eventRegistry.addEventListener('set_tab', (e) => {
    callbacks.forEach(({ callback, page, tab, subtab, bypassMatch }) => {
      if (bypassMatch) {
        callback();
        return;
      }

      if (isCurrentPage(page, tab, subtab, getCurrentPage(), e.page_arguments.tab, e.page_arguments.sub_tab)) {
        callback();
      }
    });
  });
};

/**
 * Do something when the user activates a module.
 *
 * @param {string}   module   The module to watch for.
 * @param {Function} callback The callback to run when the module is activated.
 */
const onActivation = (module, callback) => {
  onEvent('mh-improved-settings-changed', ({ key, value }) => {
    if (key === module && value) {
      callback();
    }
  });
};

/**
 * Do something when the user deactivates a module.
 *
 * @param {string}   module   The module to watch for.
 * @param {Function} callback The callback to run when the module is deactivated.
 */
const onDeactivation = (module, callback) => {
  onEvent('mh-improved-settings-changed', ({ key, value }) => {
    if (key === module && ! value) {
      callback();
    }
  });
};

/**
 * Do something when the user honks.
 *
 * @param {Function} callback The callback to run when the user honks.
 * @param {number}   delay    The delay to wait before running the callback.
 */
const onTurn = (callback, delay = null) => {
  const lifecycleCallback = prepareLifecycleCallback(callback, 'turn');
  if (lifecycleCallback.skip) {
    return;
  }

  onRequest('turns/activeturn.php', (response, request) => {
    delay = delay || Math.floor(Math.random() * 1000) + 1000;
    setTimeout(() => {
      lifecycleCallback.callback(response, request);
    }, delay);
  }, true);
};

/**
 * Do something when the user changes their trap.
 *
 * @param {Function} callback                    The callback to run when the user changes their trap.
 * @param {Object}   opts                        The options.
 * @param {boolean}  opts.runOnLoad              Whether or not to run the callback on load.
 * @param {boolean}  opts.runOnGetTrapComponents Whether or not to run the callback when getting trap components.
 */
const onTrapChange = (callback, opts) => {
  // Set the default options.
  const defaults = {
    runOnLoad: true,
    runOnGetTrapComponents: true,
  };

  // Merge the defaults with the options.
  const options = Object.assign(defaults, opts);

  if (options?.runOnLoad) {
    callback();
  }

  onRequest('users/changetrap.php', callback);

  if (options?.runOnGetTrapComponents) {
    onRequest('users/gettrapcomponents.php', callback);
  }
};

export {
  onDialogHide,
  onDialogShow,
  onNavigation,
  onOverlayChange,
  onPageChange,
  onRequest,
  onTravel,
  onActivation,
  onDeactivation,
  onTurn,
  onTrapChange
};
