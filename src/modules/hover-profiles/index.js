import {
  addStyles,
  doEvent,
  doRequest,
  onEvent,
  onRequest,
  sessionGet,
  sessionSet
} from '@utils';

import styles from './styles.css';

const cleanId = (id) => {
  return id.replaceAll('#', '');
};

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

      if (snuid.friend.sn_user_id) {
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

const makeFriendMarkup = (friendId, data = null, skipCache = false, e) => {
  if (! data || ! data.length || ! data[0].user_interactions.relationship) {
    return;
  }

  if (! skipCache) {
    sessionSet(`mh-improved-cache-friend-${friendId}`, data);
    sessionSet(`mh-improved-cache-friend-${friendId}-timestamp`, Date.now());
  }

  let content;
  if (data) {
    const templateType = data[0].user_interactions.relationship.is_stranger ? 'PageFriends_request_row' : 'PageFriends_view_friend_row';
    content = hg.utils.TemplateUtil.render(templateType, data[0]);
  } else {
    hg.pages.FriendsPage().getPlaceholderData();
  }

  const existing = document.querySelectorAll('#friend-data-wrapper');
  if (existing && existing.length) {
    existing.forEach((el) => {
      el.remove();
    });
  }

  const friendDataWrapper = document.createElement('div', 'friend-data-wrapper');
  friendDataWrapper.id = 'friend-data-wrapper';
  friendDataWrapper.innerHTML = content;

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
      friendDataWrapper.remove();
    }, 500); // delay in milliseconds
  });

  // cancel the removal if the mouse enters the tooltip
  friendDataWrapper.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
  });

  // also hide it if the parent element is no longer being hovered
  const parent = e.target.parentElement;
  if (parent) {
    parent.addEventListener('mouseleave', () => {
      timeoutId = setTimeout(() => {
        friendDataWrapper.remove();
      }, 500); // delay in milliseconds
    });

    // cancel the removal if the mouse enters the tooltip
    parent.addEventListener('mouseenter', () => {
      clearTimeout(timeoutId);
    });
  }

  doEvent('profile_hover');
};

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

const addFriendLinkEventListener = (selector) => {
  const friendLinks = document.querySelectorAll(selector);
  if (! friendLinks || ! friendLinks.length) {
    return;
  }

  friendLinks.forEach((friendLink) => {
    if (friendLink.classList.contains('friendsPage-friendRow-image')) {
      return;
    }

    friendLink.addEventListener('mouseenter', onFriendLinkHover);
  });
};

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

const onTabChange = (callback) => {
  onEvent('ajax_response', () => {
    onTabChangeCallback(callback);
  });
};

const onInboxOpen = (callback) => {
  const inboxBtn = document.querySelector('#hgbar_messages');
  if (! inboxBtn) {
    return;
  }

  inboxBtn.addEventListener('click', () => {
    onTabChange(callback);
  });
};

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

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'hover-profiles');

  setTimeout(main, 500);
  onRequest('*', () => {
    setTimeout(main, 1000);
  });

  onInboxOpen(main);
};

export default {
  id: 'hover-profiles',
  name: 'Hover Profiles',
  type: 'feature',
  default: true,
  description: 'Hover over a friend\'s name in your journal, inbox, or elsewhere and get a mini-profile popup.',
  load: init,
};
