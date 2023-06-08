import { addUIStyles } from '../utils';
import styles from './styles.css';

const getFriendId = async (target) => {
  // if there is a data-snuid attribute, use that
  if (target.getAttribute('data-snuid')) {
    return target.getAttribute('data-snuid');
  }

  if (target.href) {
    // if the href is a profile link, use that
    const urlMatch = target.href
      .replace('https://www.mousehuntgame.com/hunterprofile.php?snuid=', '')
      .replace('https://www.mousehuntgame.com/profile.php?snuid=', '');
    if (urlMatch && urlMatch !== target.href) {
      return urlMatch;
    }

    const pMatch = target.href.replace('https://www.mousehuntgame.com/p.php?id=', '');
    if (pMatch && pMatch !== target.href) {
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
    sessionStorage.setItem(`friend-${friendId}`, JSON.stringify(data));
    sessionStorage.setItem(`friend-${friendId}-timestamp`, Date.now());
  }

  const templateType = data[0].user_interactions.relationship.is_stranger ? 'PageFriends_request_row' : 'PageFriends_view_friend_row';
  const content = hg.utils.TemplateUtil.render(templateType, data[0]);

  const friendDataWrapper = document.createElement('div', 'friend-data-wrapper');
  friendDataWrapper.id = 'friend-data-wrapper';
  friendDataWrapper.innerHTML = content;

  const friendLinkParent = e.target.parentElement;
  friendLinkParent.appendChild(friendDataWrapper);

  // // make sure it's not off the screen
  // const rect = friendDataWrapper.getBoundingClientRect();
  // const left = rect.left;
  // const right = rect.right;
  // const top = rect.top;

  // const windowWidth = window.innerWidth;

  // if (left < 0) {
  //   friendDataWrapper.style.left = '0px';
  // }

  // if (right > windowWidth) {
  //   friendDataWrapper.style.left = `${windowWidth - right}px`;
  // }

  // if (top < 0) {
  //   friendDataWrapper.style.top = '5px';
  // }

  eventRegistry.doEvent('profile_hover');
};

const onFriendLinkHover = async (e) => {
  const friendId = await getFriendId(e.target);
  if (! friendId || friendId == user.sn_user_id) { // eslint-disable-line eqeqeq
    return;
  }

  console.log('friendId', friendId);

  // TODO: only ignore the list of friends, not the inbox.
  // if ('friends' === getCurrentPage()) {
  //   return;
  // }

  const existing = document.getElementById('friend-data-wrapper');
  if (existing) {
    existing.remove();
  }

  // See if there is a cached value in sessionStorage
  const cached = sessionStorage.getItem(`friend-${friendId}`);
  const cachedTimestamp = sessionStorage.getItem(`friend-${friendId}-timestamp`);

  if (cached && cachedTimestamp && (Date.now() - cachedTimestamp) < 300000) {
    makeFriendMarkup(friendId, JSON.parse(cached), true, e);
  } else {
    app.pages.FriendsPage.getFriendDataBySnuids([friendId], (data) => {
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

  //   // remove the popup when the mouse leaves the link or the popup
    friendLink.addEventListener('mouseleave', () => {
  //     const mouseLeaveTarget = addEventListener('mousemove', (e) => {
        const existing = document.getElementById('friend-data-wrapper');
        if (existing) {
  //         // get the dimensions of the popup
  //         const rect = existing.getBoundingClientRect();

  //         // get the mouse position
  //         const x = e.clientX;
  //         const y = e.clientY;

  //         const bottom = rect.bottom + 100;
  //         const top = rect.top - 100;
  //         const left = rect.left - 100;
  //         const right = rect.right + 100;

  //         // if the mouse is outside the popup, remove it
  //         if (y < top || y > bottom || x < left || x > right) {
            // existing.remove();
            console.log('removing');
  //           removeEventListener('mousemove', mouseLeaveTarget);
          }
  //       }
  //     });
    });
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

export default function betterFriends() {
  addUIStyles(styles);

  setTimeout(() => {
    main();
  }, 250);

  onEvent('ajax_response', () => {
    setTimeout(() => {
      main();
    }, 250);
  });

  onEvent('journal_replacements_finished', main);
  onInboxOpen(main);
}
