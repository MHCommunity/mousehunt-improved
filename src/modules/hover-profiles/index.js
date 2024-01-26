import {
  addStyles,
  doRequest,
  onEvent,
  onRequest,
  sessionGet,
  sessionSet
} from '@utils';

import styles from './styles.css';

const getFriendId = async (target) => {
  // if there is a data-snuid attribute, use that
  if (target.getAttribute('data-snuid')) {
    return target.getAttribute('data-snuid');
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
      return urlMatch;
    }

    const pMatch = href.replace('https://www.mousehuntgame.com/p.php?id=', '');
    if (pMatch && pMatch !== href) {
      const snuid = await doRequest('managers/ajax/pages/friends.php', {
        action: 'community_search_by_id',
        user_id: pMatch,
      });

      if (snuid.friend.sn_user_id) {
        return snuid.friend.sn_user_id;
      }
    }
  }

  if (target.onclick) {
    const giftMatch = target.onclick.toString().match(/show\('(.+)'\)/);
    if (giftMatch && giftMatch.length) {
      return giftMatch[1];
    }
  }

  return false;
};

const makeFriendMarkup = (friendId, data, skipCache = false, e) => {
  if (! data || ! data.length || ! data[0].user_interactions.relationship) {
    return;
  }

  if (! skipCache) {
    sessionSet(`mh-improved-cache-friend-${friendId}`, data);
    sessionSet(`mh-improved-cache-friend-${friendId}-timestamp`, Date.now());
  }

  const templateType = data[0].user_interactions.relationship.is_stranger ? 'PageFriends_request_row' : 'PageFriends_view_friend_row';
  const content = hg.utils.TemplateUtil.render(templateType, data[0]);

  const friendDataWrapper = document.createElement('div', 'friend-data-wrapper');
  friendDataWrapper.id = 'friend-data-wrapper';
  friendDataWrapper.innerHTML = content;

  const friendLinkParent = e.target.parentElement;
  if (friendLinkParent) {
    friendLinkParent.append(friendDataWrapper);
  } else {
    e.target.append(friendDataWrapper);
  }

  eventRegistry.doEvent('profile_hover');
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
  ];

  selectors.forEach((selector) => {
    addFriendLinkEventListener(selector);
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  setTimeout(main, 500);
  onRequest(() => {
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
