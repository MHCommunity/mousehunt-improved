import { addUIStyles } from '../utils';
import styles from './styles.css';

const getFriendId = (target) => {
  // if there is a data-snuid attribute, use that
  if (target.getAttribute('data-snuid')) {
    return target.getAttribute('data-snuid');
  }

  if (target.href) {
    // if the href is a profile link, use that
    const urlMatch = target.href
      .replace('https://www.mousehuntgame.com/hunterprofile.php?snuid=', '')
      .replace('https://www.mousehuntgame.com/profile.php?snuid=', '')
    if (urlMatch && urlMatch !== target.href) {
      return urlMatch;
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

  // Get the parent parent element of the friend link
  const friendLinkParent = e.target.parentElement;
  friendLinkParent.appendChild(friendDataWrapper);
};

const onFriendLinkHover = (e) => {
  const friendId = getFriendId(e.target);
  if (! friendId || friendId == user.sn_user_id) { // eslint-disable-line eqeqeq
    return;
  }

  if ('friends' === getCurrentPage()) {
    return;
  }

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
    friendLink.addEventListener('mouseenter', onFriendLinkHover);

    // remove the popup when the mouse leaves the link or the popup
    friendLink.addEventListener('mouseleave', () => {
      const mouseLeaveTarget = addEventListener('mousemove', (e) => {
        const existing = document.getElementById('friend-data-wrapper');
        if (existing) {
          // get the dimensions of the popup
          const rect = existing.getBoundingClientRect();

          // get the mouse position
          const x = e.clientX;
          const y = e.clientY;

          const bottom = rect.bottom + 25;
          const top = rect.top - 25;
          const left = rect.left - 25;
          const right = rect.right + 25;

          // if the mouse is outside the popup, remove it
          if (y < top || y > bottom || x < left || x > right) {
            existing.remove();

            removeEventListener('mousemove', mouseLeaveTarget);
          }
        }
      });
    });
  });
};

const main = () => {
  addFriendLinkEventListener('a[href*="https://www.mousehuntgame.com/hunterprofile.php"]');
  addFriendLinkEventListener('a[href*="https://www.mousehuntgame.com/profile.php"]');
  addFriendLinkEventListener('.entry.socialGift .journaltext a');
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
}
