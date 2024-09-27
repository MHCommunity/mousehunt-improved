import {
  addStyles,
  doEvent,
  doRequest,
  getSetting,
  makeElement,
  onEvent,
  onRequest,
  sessionGet,
  sessionSet
} from '@utils';

import styles from './styles.css';

/**
 * Clean the ID string.
 *
 * @param {string} id The ID to clean.
 *
 * @return {string} The cleaned ID.
 */
const cleanId = (id) => {
  return id.replaceAll('#', '');
};

/**
 * Get the friend ID from the target.
 *
 * @param {HTMLElement} target The target element.
 *
 * @return {string|boolean} The friend ID or false.
 */
const getFriendId = async (target) => {
  // if there is a data-snuid attribute, use that
  if (target.getAttribute('data-snuid')) {
    return cleanId(target.getAttribute('data-snuid'));
  }

  if (target.href) {
    let href = target.href;

    // remove everything after the & in the href
    const hrefMatch = target.href.match(/(.+?)&/);
    if (hrefMatch && hrefMatch.length) {
      href = hrefMatch[1];
    }

    // if the href is a profile link, use that
    const urlMatch = href
      .replace('https://www.mousehuntgame.com/hunterprofile.php?snuid=', '')
      .replace('https://www.mousehuntgame.com/profile.php?snuid=', '');
    if (urlMatch && urlMatch !== href) {
      return cleanId(urlMatch);
    }

    const pMatch = href.replace('https://www.mousehuntgame.com/p.php?id=', '');
    if (pMatch && pMatch !== href) {
      const snuid = await doRequest('managers/ajax/pages/friends.php', {
        action: 'community_search_by_id',
        user_id: pMatch,
      });

      if (snuid?.friend?.sn_user_id) {
        return cleanId(snuid.friend.sn_user_id);
      }
    }
  }

  if (target.onclick) {
    const giftMatch = target.onclick.toString().match(/show\('(.+)'\)/);
    if (giftMatch && giftMatch.length) {
      return cleanId(giftMatch[1]);
    }
  }

  return false;
};

let friendDataWrapper;

/**
 * Create the friend markup.
 *
 * @param {string}  friendId  The friend ID.
 * @param {Object}  data      The friend data.
 * @param {boolean} skipCache Skip the cache.
 * @param {Event}   e         The event.
 */
const makeFriendMarkup = (friendId, data = null, skipCache = false, e) => {
  if (! skipCache) {
    sessionSet(`mh-improved-cache-friend-${friendId}`, data);
    sessionSet(`mh-improved-cache-friend-${friendId}-timestamp`, Date.now());
  }

  friendDataWrapper?.remove();

  let content;
  if (data && data.length) {
    const templateType = ! data[0].user_interactions?.relationship?.is_stranger ? 'PageFriends_view_friend_row' : 'PageFriends_request_row'; // eslint-disable-line unicorn/no-negated-condition
    content = hg.utils.TemplateUtil.render(templateType, data[0]);
  } else {
    content = hg.utils.TemplateUtil.render('PageFriends_view_friend_row', hg.pages.FriendsPage().getPlaceholderData());
  }

  const existing = document.querySelectorAll('#friend-data-wrapper');
  if (existing && existing.length) {
    existing.forEach((el) => {
      el.remove();
    });
  }

  friendDataWrapper = makeElement('div', 'friend-data-wrapper');
  friendDataWrapper.id = 'friend-data-wrapper';
  friendDataWrapper.innerHTML = content || '<span class="friend-data-wrapper-loading">Loading…</span>';

  // append to the body and position it
  document.body.append(friendDataWrapper);
  const rect = e.target.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  // Calculate the desired top position for the tooltip
  let tooltipTop = top - friendDataWrapper.offsetHeight - 10;

  // Check if the tooltip would end up off the screen
  if (tooltipTop < 0) {
    // If it would, position it below the target element instead
    tooltipTop = top + rect.height + 10;
  }

  friendDataWrapper.style.top = `${tooltipTop}px`;
  friendDataWrapper.style.left = `${left - (friendDataWrapper.offsetWidth / 2) + (rect.width / 2)}px`;
  let timeoutId;

  // add a mouseleave event to remove it
  friendDataWrapper.addEventListener('mouseleave', () => {
    timeoutId = setTimeout(() => {
      if (! debugPopup) {
        friendDataWrapper.remove();
      }
    }, 250); // delay in milliseconds
  });

  // cancel the removal if the mouse enters the tooltip
  friendDataWrapper.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
  });

  doEvent('profile_hover');
};

/**
 * Handle the friend link hover.
 *
 * @param {Event} e The event.
 */
const onFriendLinkHover = async (e) => {
  const friendId = await getFriendId(e.target);
  if (! friendId || friendId == user.sn_user_id) { // eslint-disable-line eqeqeq
    return;
  }

  e.target.setAttribute('data-snuid', friendId);

  // get the parent element
  const parent = e.target.parentElement;
  if (! parent) {
    return;
  }

  parent.setAttribute('data-friend-hover', true);

  const existing = document.querySelectorAll('#friend-data-wrapper');
  if (existing && existing.length) {
    existing.forEach((el) => {
      el.remove();
    });
  }

  // See if there is a cached value in sessionStorage
  const cached = sessionGet(`mh-improved-cache-friend-${friendId}`);
  const cachedTimestamp = sessionGet(`mh-improved-cache-friend-${friendId}-timestamp`);

  if (cached && cachedTimestamp && (Date.now() - cachedTimestamp) < 150000) {
    makeFriendMarkup(friendId, cached, true, e);
  } else {
    makeFriendMarkup(null, null, true, e);

    app.pages.FriendsPage.getFriendDataBySnuids([friendId], (data) => {
      if (! data || ! data.length) {
        return;
      }

      makeFriendMarkup(friendId, data, false, e);
    });
  }
};

/**
 * Add click event listeners to friend links.
 *
 * @param {string} selector The selector to use.
 */
const addFriendLinkEventListener = (selector) => {
  const friendLinks = document.querySelectorAll(selector);
  if (! friendLinks || ! friendLinks.length) {
    return;
  }

  friendLinks.forEach((friendLink) => {
    if (friendLink.classList.contains('friendsPage-friendRow-image')) {
      return;
    }

    if (friendLink.getAttribute('data-friend-hover')) {
      return;
    }

    friendLink.setAttribute('data-friend-hover', true);

    let timer;
    friendLink.addEventListener('mouseover', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => onFriendLinkHover(e), 200);
    });

    friendLink.addEventListener('mouseout', () => {
      clearTimeout(timer);
    });
  });
};

/**
 * Function to handle tab changes.
 *
 * @param {Function} callback The callback function.
 * @param {number}   attempts The number of attempts.
 */
const onTabChangeCallback = (callback, attempts = 0) => {
  const tabs = document.querySelectorAll('.notificationHeader .tabs a');
  if (! tabs || tabs.length === 0) {
    if (attempts > 2) {
      return;
    }

    setTimeout(() => {
      onTabChangeCallback(callback, attempts + 1);
    }, 250);
    return;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      callback();
    });
  });
};

/**
 * When the tab changes, wait for the ajax call and then run the callback.
 *
 * @param {Function} callback The callback function.
 */
const onTabChange = (callback) => {
  onEvent('ajax_response', () => {
    onTabChangeCallback(callback);
  });
};

/**
 * Call the callback when the inbox is opened.
 *
 * @param {Function} callback The callback function.
 */
const onInboxOpen = (callback) => {
  const inboxBtn = document.querySelector('#hgbar_messages');
  if (! inboxBtn) {
    return;
  }

  inboxBtn.addEventListener('click', () => {
    onTabChange(callback);
  });
};

/**
 * The main function.
 */
const main = () => {
  const selectors = [
    'a[href*="https://www.mousehuntgame.com/hunterprofile.php"]',
    'a[href*="https://www.mousehuntgame.com/profile.php"]',
    '.entry.socialGift .journaltext a',
    '.notificationMessageList .messageText a[href*="https://www.mousehuntgame.com/p"]',
    'tr.teamPage-memberRow-identity a[href*="https://www.mousehuntgame.com/profile.php"]',
    '.treasureMapView-scoreboard-table a[href*="https://www.mousehuntgame.com/profile.php"]',
  ];

  selectors.forEach((selector) => {
    addFriendLinkEventListener(selector);
  });
};

let debugPopup = false;
/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'hover-profiles');

  debugPopup = getSetting('debug.hover-popups', false);

  setTimeout(main, 500);
  onRequest('*', () => {
    setTimeout(main, 1000);
  });

  onInboxOpen(main);
};

/**
 * Initialize the module.
 */
export default {
  id: 'hover-profiles',
  name: 'Hover Profiles',
  type: 'feature',
  default: true,
  description: 'Hover over a friend’s name in your journal, inbox, or elsewhere to get a mini-profile popup.',
  load: init,
};
