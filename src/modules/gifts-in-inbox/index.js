import {
  addStyles,
  debug,
  humanizeTime,
  lsGet,
  lsSet,
  makeElement,
  onDeactivation,
  waitForElement
} from '@utils';

import fallbackGiftImage from '@images/icons/icon-64.png';

import styles from './styles.css';

const STATE_KEY = 'mh-improved-gift-links-in-inbox-state-v1';
const TAB_TYPE = 'gift_links';
const TAB_NAME = 'Gift Links';

/**
 * How old a gift link can be and still count as new.
 */
const NEW_GIFT_MAX_AGE = 5 * 24 * 60 * 60 * 1000;

let _togglePopup = null;
let didBindClicks = false;
let cachedLinks = [];
let cacheTime = 0;

/**
 * Get the saved state of claimed and hidden gift links.
 *
 * @return {Object} The state, with `claimed` and `hidden` buckets.
 */
const getState = () => {
  try {
    const state = lsGet(STATE_KEY, {});
    return {
      claimed: state.claimed || {},
      hidden: state.hidden || {},
    };
  } catch (error) {
    debug('Unable to parse gift links inbox state', error);
    return { claimed: {}, hidden: {} };
  }
};

/**
 * Save the state to localStorage.
 *
 * @param {Object} state The state to save.
 */
const saveState = (state) => {
  lsSet(STATE_KEY, state);
};

/**
 * Mark a gift link code as belonging to a bucket (claimed or hidden).
 *
 * @param {string} code    The gift link code.
 * @param {string} bucket  The bucket to add the code to.
 * @param {string} [value] The value to store, defaulting to the current time.
 */
const markState = (code, bucket, value) => {
  const state = getState();
  state[bucket][code] = value || new Date().toISOString();
  saveState(state);
};

/**
 * Check if a gift link code is in the given bucket.
 *
 * @param {string} code   The gift link code.
 * @param {string} bucket The bucket to check.
 *
 * @return {boolean} Whether the code is in the bucket.
 */
const isInState = (code, bucket) => {
  return Boolean(getState()[bucket]?.[code]);
};

/**
 * Whether a gift link should count as new: unclaimed, and recent enough to be
 * worth badging the inbox tab for.
 *
 * A link with no timestamp can't be aged, so it's treated as recent.
 *
 * @param {Object} link The gift link.
 *
 * @return {boolean} Whether the link counts as new.
 */
const isNewGift = (link) => {
  if (isInState(link.code, 'claimed')) {
    return false;
  }

  return ! link.timestamp || (Date.now() - link.timestamp) <= NEW_GIFT_MAX_AGE;
};

/**
 * Escape HTML special characters.
 *
 * @param {string} value The value to escape.
 *
 * @return {string} The escaped value.
 */
const escapeHtml = (value = '') => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#039;');
};

/**
 * Format a timestamp to match the inbox date format, e.g. "Jun 16 - 7:58 am".
 *
 * @param {number} timestamp The timestamp in milliseconds.
 *
 * @return {string} The formatted date.
 */
const formatMessageDate = (timestamp) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;

  const month = validDate.toLocaleString('en-US', { month: 'short' });
  const day = validDate.getDate();
  const minutes = validDate.getMinutes().toString().padStart(2, '0');
  const ampm = validDate.getHours() >= 12 ? 'pm' : 'am';
  const hours = (validDate.getHours() % 12) || 12;

  return `${month} ${day} - ${hours}:${minutes} ${ampm}`;
};

/**
 * Get the display name for a gift link.
 *
 * @param {Object} link The gift link.
 *
 * @return {string} The display name.
 */
const getGiftName = (link) => {
  return link.giftName || link.reward || 'MouseHunt gift link';
};

/**
 * Get the text describing who found a gift link, e.g. "Found by Hiari".
 *
 * @param {Object} link The gift link.
 *
 * @return {string} The finder text, or an empty string if unknown.
 */
const getFinderText = (link) => {
  const finder = link.finderName || link.finder;
  if (! finder) {
    return '';
  }

  return `Found by ${finder}`;
};

/**
 * Get the expiry text for a gift link, e.g. "Expires in 2 days 3 hours" or "Expired".
 *
 * @param {Object} link The gift link.
 *
 * @return {string} The expiry text, or an empty string if there is no expiry.
 */
const getExpiresText = (link) => {
  if (! link.expiresAt) {
    return '';
  }

  const remaining = link.expiresAt - Date.now();
  if (remaining <= 0) {
    return 'Expired';
  }

  return `Expires in ${humanizeTime(remaining, { units: ['d', 'h', 'm'] })}`;
};

/**
 * Parse the gift id and hash out of an expanded claim URL.
 *
 * @param {string} url The expanded claim URL.
 *
 * @return {Object} The `giftId` and `giftHash`, either of which may be null.
 */
const parseGiftCredentials = (url) => {
  if (! url) {
    return { giftId: null, giftHash: null };
  }

  try {
    const parsed = new URL(url);
    return {
      giftId: parsed.searchParams.get('gift_id'),
      giftHash: parsed.searchParams.get('gift_hash'),
    };
  } catch {
    return { giftId: null, giftHash: null };
  }
};

/**
 * Normalize a gift link from the API into a flat shape, handling both the
 * nested (`parsed`/`gift`) and legacy flat shapes.
 *
 * @param {Object} link The raw gift link from the API.
 *
 * @return {Object} The normalized gift link.
 */
const normalizeLink = (link) => {
  const parsed = link.parsed || {};
  const gift = link.gift || {};
  const expandedUrl = gift.url || gift.expandedUrl || link.expandedUrl;

  // The API provides the id/hash directly, but fall back to parsing them out of
  // the claim URL for older shapes.
  const fromUrl = parseGiftCredentials(expandedUrl);

  return {
    code: parsed.code || link.code,
    url: parsed.url || link.url,
    reward: parsed.reward || link.reward,
    finder: parsed.finder || link.finder,
    finderName: parsed.finderName || link.finderName,
    giftName: gift.name || link.giftName,
    giftImage: gift.image || link.giftImage,
    quantity: gift.quantity ?? link.quantity,
    expiresAt: gift.expiresAt ?? link.expiresAt,
    expandedUrl,
    expired: link.expired,
    timestamp: link.timestamp,
    giftId: gift.id || link.giftId || fromUrl.giftId,
    giftHash: gift.hash || link.giftHash || fromUrl.giftHash,
  };
};

/**
 * Fetch the gift links from the API, using a short cache.
 *
 * @param {boolean} force Whether to bypass the cache.
 *
 * @return {Promise<Array>} The gift links.
 */
const fetchRewardLinks = async (force = false) => {
  if (! force && cachedLinks.length && (Date.now() - cacheTime) < 10 * 60 * 1000) { // 10 minutes.
    return cachedLinks;
  }

  try {
    const response = await fetch('https://gift-links.mouse.rip/links', {
      credentials: 'omit',
      cache: 'no-store'
    });

    if (! response.ok) {
      throw new Error(`Reward link API returned ${response.status}`);
    }

    const data = await response.json();
    cachedLinks = Array.isArray(data.links) ? data.links.map((link) => normalizeLink(link)) : [];
    cacheTime = Date.now();
  } catch (error) {
    debug('Unable to fetch reward links', error);
  }

  return cachedLinks;
};

/**
 * Build the inbox message element for a gift link, patterned off a default
 * inbox entry (image, actions, clear-block messageText, date).
 *
 * @param {Object} link The gift link.
 *
 * @return {HTMLElement} The message element.
 */
const buildMessage = (link) => {
  const claimed = isInState(link.code, 'claimed');

  const message = makeElement('div', ['message', 'notification', 'mh-improved-gift-link']);
  if (isNewGift(link)) {
    message.classList.add('new');
  }

  message.setAttribute('data-mhi-gift-code', link.code);

  const imageLink = makeElement('a', 'mh-improved-gift-link-image');
  imageLink.href = link.url;
  imageLink.target = '_blank';
  imageLink.rel = 'noopener';

  const image = makeElement('img', 'item');
  image.src = link.giftImage || fallbackGiftImage;
  image.alt = getGiftName(link);
  imageLink.append(image);
  message.append(imageLink);

  const actions = makeElement('div', ['actions', 'mh-improved-gift-link-actions']);

  const claim = makeElement('a', ['mousehuntActionButton', 'small', 'mh-improved-gift-claim']);
  claim.href = link.expandedUrl || link.url;
  claim.setAttribute('data-mhi-gift-claim', link.code);
  if (link.giftId) {
    claim.setAttribute('data-mhi-gift-id', link.giftId);
  }
  if (link.giftHash) {
    claim.setAttribute('data-mhi-gift-hash', link.giftHash);
  }
  if (link.expandedUrl) {
    claim.setAttribute('data-mhi-gift-manual-url', link.expandedUrl);
  }
  makeElement('span', '', claimed ? 'Claimed' : 'Claim', claim);

  if (claimed) {
    message.classList.add('claimed');
    claim.classList.add('disabled', 'small');
    claim.target = '_blank';
    claim.rel = 'noopener';
  } else {
    claim.classList.add('readNewsPost');
  }

  actions.append(claim);
  message.append(actions);

  const clearBlock = makeElement('div', 'clear-block');

  makeElement('span', 'messageText', `<b>${escapeHtml(getGiftName(link))}</b> from Larry the Friendly Knight!`, clearBlock);

  const metaParts = [getFinderText(link), getExpiresText(link)]
    .filter(Boolean)
    .map((part) => escapeHtml(part));
  if (metaParts.length) {
    makeElement('div', 'mh-improved-gift-meta', metaParts.join('<span class="mh-improved-gift-meta-separator">-</span>'), clearBlock);
  }

  message.append(clearBlock);

  makeElement('div', 'date', formatMessageDate(link.timestamp), message);

  return message;
};

/**
 * Update a gift link message to reflect its claimed state. The button stays a
 * working link to the gift page so it can be claimed manually if something
 * went wrong.
 *
 * @param {HTMLElement} message     The gift link message element.
 * @param {HTMLElement} claimButton The claim button element.
 */
const showClaimed = (message, claimButton) => {
  const label = claimButton.querySelector('span');
  if (label) {
    label.textContent = 'Claimed';
  }

  claimButton.classList.remove('busy', 'readNewsPost');
  claimButton.classList.add('disabled', 'small');

  const manualUrl = claimButton.dataset.mhiGiftManualUrl;
  if (manualUrl) {
    claimButton.href = manualUrl;
  }
  claimButton.target = '_blank';
  claimButton.rel = 'noopener';

  if (message) {
    message.classList.remove('new');
    message.classList.add('claimed');
  }
};

/**
 * Show a claim error below the claim button, turn the button into a manual
 * claim link, and offer a "Mark as claimed" link for gifts that were already
 * claimed elsewhere.
 *
 * @param {HTMLElement} message     The gift link message element.
 * @param {HTMLElement} claimButton The claim button element.
 * @param {string}      errorText   The error message to display.
 */
const showClaimError = (message, claimButton, errorText) => {
  claimButton.classList.remove('busy', 'disabled');
  claimButton.setAttribute('data-mhi-gift-claim-state', 'error');

  const label = claimButton.querySelector('span');
  if (label) {
    label.textContent = 'Claim manually';
  }

  const manualUrl = claimButton.dataset.mhiGiftManualUrl;
  if (manualUrl) {
    claimButton.href = manualUrl;
    claimButton.target = '_blank';
    claimButton.rel = 'noopener';
  }

  const actions = claimButton.closest('.actions') || message;
  if (! actions) {
    return;
  }

  let error = actions.querySelector('.mh-improved-gift-claim-error');
  if (! error) {
    error = makeElement('div', 'mh-improved-gift-claim-error', '', actions);
  }

  error.textContent = errorText;
  error.hidden = false;

  let markClaimed = actions.querySelector('.mh-improved-gift-mark-claimed');
  if (! markClaimed) {
    markClaimed = makeElement('a', 'mh-improved-gift-mark-claimed', 'Mark as claimed');
    markClaimed.href = '#';
    markClaimed.setAttribute('data-mhi-gift-mark-claimed', claimButton.dataset.mhiGiftClaim);
    actions.append(markClaimed);
  }

  markClaimed.hidden = false;
};

/**
 * Claim a gift link in place, without a page refresh.
 *
 * @param {HTMLElement} claimButton The claim button that was clicked.
 *
 * @return {boolean} Whether the default link navigation should be prevented.
 */
const claimGiftInPlace = (claimButton) => {
  // After an error we let the button navigate to the manual claim page.
  if (claimButton.getAttribute('data-mhi-gift-claim-state') === 'error') {
    return false;
  }

  // A claim is in progress.
  if (claimButton.classList.contains('busy')) {
    return true;
  }

  // Already claimed: let the button act as a link to the gift page in case
  // something went wrong with the in-place claim.
  if (claimButton.classList.contains('disabled')) {
    return false;
  }

  const code = claimButton.dataset.mhiGiftClaim;
  const giftId = claimButton.dataset.mhiGiftId;
  const giftHash = claimButton.dataset.mhiGiftHash;
  const message = claimButton.closest('.message.mh-improved-gift-link');

  // If we can't claim directly, fall back to opening the claim page in a new tab.
  if (! giftId || ! giftHash || ! hg?.utils?.SocialGift?.claimGift) {
    markState(code, 'claimed');
    message?.classList.remove('new');
    refreshGiftTabState();
    return false;
  }

  // Mark as loading.
  claimButton.classList.add('busy', 'disabled');
  const label = claimButton.querySelector('span');
  if (label) {
    label.textContent = 'Claiming…';
  }

  // Clear any previous error.
  const previousError = message?.querySelector('.mh-improved-gift-claim-error');
  if (previousError) {
    previousError.hidden = true;
    previousError.textContent = '';
  }

  hg.utils.SocialGift.claimGift(
    giftId,
    giftHash,
    (data) => {
      const claimDate = data?.gift_claim?.claim_date || '';
      markState(code, 'claimed', claimDate);
      showClaimed(message, claimButton);
      refreshGiftTabState();
    },
    (data) => {
      const errorText = data?.gift?.claim_error || 'Sorry, something went wrong.';
      showClaimError(message, claimButton, errorText);
    }
  );

  return true;
};

/**
 * Show the gift links tab, hiding the other tabs.
 */
const showGiftTab = () => {
  document.querySelectorAll('#messengerUINotification .notificationHeader .tabs a').forEach((tab) => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('#messengerUINotification .notificationMessageList .tab').forEach((panel) => {
    panel.classList.remove('active');
  });

  document.querySelector(`#messengerUINotification .tabs a[data-tab="${TAB_TYPE}"]`)?.classList.add('active');
  document.querySelector(`#messengerUINotification .notificationMessageList .tab[data-tab="${TAB_TYPE}"]`)?.classList.add('active');
};

/**
 * Deactivate the gift links tab, used when another tab is selected.
 */
const deactivateGiftTab = () => {
  document.querySelector(`#messengerUINotification .tabs a[data-tab="${TAB_TYPE}"]`)?.classList.remove('active');
  document.querySelector(`#messengerUINotification .notificationMessageList .tab[data-tab="${TAB_TYPE}"]`)?.classList.remove('active');
};

/**
 * Check whether any of the game's own inbox tabs have unread messages.
 *
 * @return {boolean} Whether there are unread messages in any other tab.
 */
const hasOtherUnreadMessages = () => {
  const data = messenger?.UI?.notification?.messageData;
  return Boolean(data?.newMessageCount);
};

/**
 * Recalculate the tab counter and empty state from the currently rendered messages.
 */
const refreshGiftTabState = () => {
  const tab = document.querySelector(`#messengerUINotification .tabs a[data-tab="${TAB_TYPE}"]`);
  const panel = document.querySelector(`#messengerUINotification .notificationMessageList .tab[data-tab="${TAB_TYPE}"]`);
  if (! tab || ! panel) {
    return;
  }

  const messages = panel.querySelectorAll('.message.mh-improved-gift-link');
  const newCount = panel.querySelectorAll('.message.mh-improved-gift-link.new').length;

  const counter = tab.querySelector('.counter');
  if (counter) {
    counter.textContent = newCount;
  }

  tab.classList.toggle('new', newCount > 0);
  tab.classList.toggle('empty', messages.length === 0);

  if (messages.length === 0 && ! panel.querySelector('.empty')) {
    makeElement('div', 'empty', 'You have no gift links right now.', panel);
  }
};

/**
 * Render the gift links tab and its messages into the open inbox.
 *
 * @return {Promise<number>} The number of new gift links rendered.
 */
const renderGiftTab = async () => {
  const tabsBar = document.querySelector('#messengerUINotification .notificationHeader .tabs');
  const list = document.querySelector('#messengerUINotification .notificationMessageList');
  if (! tabsBar || ! list) {
    return 0;
  }

  const allLinks = await fetchRewardLinks();
  const links = allLinks
    .filter((link) => link?.code && link?.url)
    .filter((link) => ! link.expired)
    .filter((link) => ! isInState(link.code, 'hidden'))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Build (or find) the tab anchor, matching the game's inbox tab markup.
  let tab = tabsBar.querySelector(`a[data-tab="${TAB_TYPE}"]`);
  if (! tab) {
    tab = makeElement('a', 'tab');
    tab.href = '#';
    tab.setAttribute('data-tab', TAB_TYPE);
    tab.innerHTML = `${TAB_NAME}<div class="counter">0</div><div class="arrowShadow"></div><div class="arrow"></div>`;
    tabsBar.append(tab);

    tab.addEventListener('click', (event) => {
      event.preventDefault();
      showGiftTab();
    });

    // Hide our tab when one of the game's tabs is selected.
    tabsBar.querySelectorAll(`a[data-tab]:not([data-tab="${TAB_TYPE}"])`).forEach((other) => {
      other.addEventListener('click', deactivateGiftTab);
    });
  }

  // Build (or find) the message panel.
  let panel = list.querySelector(`.tab[data-tab="${TAB_TYPE}"]`);
  if (! panel) {
    panel = makeElement('div', 'tab');
    panel.setAttribute('data-tab', TAB_TYPE);
    list.append(panel);
  }

  panel.innerHTML = '';
  if (links.length === 0) {
    makeElement('div', 'empty', 'You have no gift links right now.', panel);
  } else {
    links.forEach((link) => panel.append(buildMessage(link)));
  }

  refreshGiftTabState();

  return links.filter((link) => isNewGift(link)).length;
};

/**
 * Bind the delegated click handling for claiming and hiding gift links.
 */
const bindClickTracking = () => {
  if (didBindClicks) {
    return;
  }

  didBindClicks = true;

  document.addEventListener('click', (event) => {
    const claim = event.target.closest?.('[data-mhi-gift-claim]');
    if (claim) {
      if (claimGiftInPlace(claim)) {
        event.preventDefault();
      }

      return;
    }

    const markClaimed = event.target.closest?.('[data-mhi-gift-mark-claimed]');
    if (markClaimed) {
      event.preventDefault();

      const message = markClaimed.closest('.message.mh-improved-gift-link');
      const claimButton = message?.querySelector('[data-mhi-gift-claim]');

      markState(markClaimed.dataset.mhiGiftMarkClaimed, 'claimed');

      if (claimButton) {
        claimButton.removeAttribute('data-mhi-gift-claim-state');
        showClaimed(message, claimButton);
      }

      const error = message?.querySelector('.mh-improved-gift-claim-error');
      if (error) {
        error.hidden = true;
      }

      markClaimed.hidden = true;
      refreshGiftTabState();

      return;
    }

    const hide = event.target.closest?.('[data-mhi-gift-hide]');
    if (hide) {
      event.preventDefault();
      markState(hide.dataset.mhiGiftHide, 'hidden');
      hide.closest('.message.mh-improved-gift-link')?.remove();
      refreshGiftTabState();
    }
  });
};

/**
 * Hook the inbox open to render the gift links tab.
 */
const hookInbox = () => {
  if (! messenger?.UI?.notification?.togglePopup) {
    return;
  }

  if (! _togglePopup) {
    _togglePopup = messenger.UI.notification.togglePopup;
  }

  messenger.UI.notification.togglePopup = function (...args) {
    const result = _togglePopup.apply(this, args);

    waitForElement('#messengerUINotification .notificationHeader .tabs a').then(async (found) => {
      if (! found) {
        return found;
      }

      const unclaimedCount = await renderGiftTab();

      // If there are new, unclaimed gift links and nothing unread in any of the
      // game's own tabs, jump straight to the gift links tab.
      if (unclaimedCount > 0 && ! hasOtherUnreadMessages()) {
        messenger.UI.notification.showTab(TAB_TYPE);
      }

      return found;
    }).catch((error) => debug('Unable to render gift links tab', error));

    return result;
  };
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'gifts-in-inbox');
  bindClickTracking();

  if ('undefined' !== typeof messenger) {
    hookInbox();
  }

  // Pre-warm the cache so opening the inbox is instant.
  fetchRewardLinks();

  onDeactivation('gifts-in-inbox', () => {
    if (_togglePopup && messenger?.UI?.notification) {
      messenger.UI.notification.togglePopup = _togglePopup;
      _togglePopup = null;
    }

    document.querySelector(`#messengerUINotification .tabs a[data-tab="${TAB_TYPE}"]`)?.remove();
    document.querySelector(`#messengerUINotification .notificationMessageList .tab[data-tab="${TAB_TYPE}"]`)?.remove();
  });
};

export default {
  id: 'gifts-in-inbox',
  name: 'Gifts in Inbox',
  type: 'social-profiles',
  default: true,
  description: 'Adds recently discovered MouseHunt gift links to a "Gift Links" tab in the inbox for easy claiming.',
  load: init,
};
