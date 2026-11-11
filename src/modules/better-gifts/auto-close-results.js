import { getFlag, overrideWhileEnabled } from '@utils';

const MODULE_ID = 'better-gifts';
const CLOSE_AFTER_MS = 2000;
const FADE_MS = 300;

let closeTimer = null;

/**
 * Get the overlay that holds the gift result panel.
 *
 * @return {HTMLElement|null} The overlay.
 */
const getOverlay = () => document.querySelector('#overlayPopup.giftSelectorViewPopup .giftSelectorView-confirmOverlay');

/**
 * Stop a pending close.
 */
const cancelClose = () => {
  clearTimeout(closeTimer);
  closeTimer = null;
  getOverlay()?.classList.remove('mh-gift-results-closing');
};

/**
 * Fade the result panel out and close it the same way its Done button does.
 */
const close = () => {
  const overlay = getOverlay();
  if (!overlay?.classList.contains('active')) {
    return;
  }

  overlay.classList.add('mh-gift-results-closing');
  closeTimer = setTimeout(() => {
    closeTimer = null;
    overlay.classList.remove('mh-gift-results-closing');
    hg.views.GiftSelectorView.hideConfirm();
  }, FADE_MS);
};

/**
 * Close the result panel after a moment, waiting while the pointer is over it.
 */
const scheduleClose = () => {
  cancelClose();
  closeTimer = setTimeout(() => {
    const overlay = getOverlay();
    if (overlay?.matches(':hover')) {
      overlay.addEventListener('mouseleave', scheduleClose, { once: true });
      return;
    }

    close();
  }, CLOSE_AFTER_MS);
};

/**
 * Close the "Done!" panel on its own after gifts are sent or claimed.
 */
const autoCloseResults = () => {
  const view = hg?.views?.GiftSelectorView;
  if (!view) {
    return;
  }

  /**
   * Schedule the close once the game has shown the results.
   *
   * @param {Function} original     The game's showComplete.
   * @param {string}   responseHtml The result markup from the server.
   * @param {...*}     args         The rest of the showComplete arguments.
   *
   * @return {*} The game's return value.
   */
  overrideWhileEnabled(MODULE_ID, view, 'showComplete', (original, responseHtml, ...args) => {
    const result = original.call(view, responseHtml, ...args);

    // Leave the panel up when the server reports a problem with any of the gifts.
    const hasProblem = /error|fail|unable|could not|couldn't|not enough|limit/i.test(String(responseHtml ?? ''));
    if (!getFlag('better-gifts-keep-results') && !hasProblem) {
      scheduleClose();
    }

    return result;
  });

  /**
   * Drop a pending close when the panel is closed or reused for something else.
   *
   * @param {Function} original The game's method.
   * @param {...*}     args     The method arguments.
   *
   * @return {*} The game's return value.
   */
  const cancelThenCall = (original, ...args) => {
    cancelClose();
    return original.apply(view, args);
  };

  overrideWhileEnabled(MODULE_ID, view, 'hideConfirm', cancelThenCall);
  overrideWhileEnabled(MODULE_ID, view, 'showLoading', cancelThenCall);
};

export default autoCloseResults;
