import { getSetting, makeElement, overrideWhileEnabled } from '@utils';

const MODULE_ID = 'better-gifts';
const SETTING_ID = 'better-gifts.hide-inactive-friends';
const INACTIVE_AFTER_DAYS = 30;

let inactiveSnuids = new Set();
let showInactive = false;

/**
 * Whether a friend's last activity is more than a month ago.
 *
 * The date comes back from the game as "YYYY-MM-DD HH:MM:SS". Friends without a date are kept.
 *
 * @param {Object} friend The friend data.
 *
 * @return {boolean} Whether the friend is inactive.
 */
const isInactive = (friend) => {
  const date = friend?.last_active_date;
  if (!date) {
    return false;
  }

  const lastActive = new Date(String(date).replace(' ', 'T')).getTime();
  if (Number.isNaN(lastActive)) {
    return false;
  }

  return Date.now() - lastActive > INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000;
};

/**
 * Get the container the game renders the friend list into.
 *
 * @return {HTMLElement|null} The container.
 */
const getFriendList = () => document.querySelector('#overlayPopup.giftSelectorViewPopup .giftSelectorView-hiddenFriendsContainer');

/**
 * Mark the inactive friends in the rendered list and keep the note at the bottom up to date.
 */
const applyToList = () => {
  const list = getFriendList();
  if (!list) {
    return;
  }

  const enabled = getSetting(SETTING_ID, true);
  let count = 0;

  list.querySelectorAll('.giftSelectorView-friend[data-snuid]').forEach((friend) => {
    const inactive = enabled && inactiveSnuids.has(String(friend.dataset.snuid));
    friend.classList.toggle('mh-gift-inactive', inactive);
    if (inactive) {
      count++;
    }
  });

  list.classList.toggle('mh-gift-show-inactive', showInactive);

  let note = list.querySelector('.mh-gift-inactive-note');
  if (!count) {
    note?.remove();
    return;
  }

  if (!note) {
    note = makeElement('div', ['giftSelectorView-friend-group', 'mh-gift-inactive-note']);
    makeElement('div', 'giftSelectorView-friend-group-title', '', note);
  }

  const friends = 1 === count ? 'friend' : 'friends';
  const title = note.querySelector('.giftSelectorView-friend-group-title');
  title.textContent = showInactive ? `Showing ${count} inactive ${friends}. ` : `${count} inactive ${friends} hidden. `;
  makeElement('a', 'mh-gift-inactive-toggle', showInactive ? 'Hide' : 'Show', title).href = '#';

  // The game appends each group as it finishes rendering, so move the note back to the end.
  list.append(note);
};

/**
 * Flip between hiding and showing the inactive friends.
 *
 * @param {Event} event The click event.
 */
const onToggleClick = (event) => {
  if (!event.target.closest('.mh-gift-inactive-toggle')) {
    return;
  }

  event.preventDefault();
  showInactive = !showInactive;
  applyToList();
};

/**
 * Leave friends who haven't played in a month out of the gift selector's friend list.
 */
const hideInactiveFriends = () => {
  const view = hg?.views?.GiftSelectorView;
  const userUtil = hg?.utils?.User;
  if (!view || !userUtil) {
    return;
  }

  /**
   * Ask for each friend's last active date along with the friend list the selector already loads.
   *
   * @param {Function} original    The game's getFriendsAndTeamMembers.
   * @param {Array}    extraFields The fields to request.
   * @param {...*}     args        The success and error callbacks.
   *
   * @return {*} The game's return value.
   */
  overrideWhileEnabled(MODULE_ID, userUtil, 'getFriendsAndTeamMembers', (original, extraFields, ...args) => {
    const fields = Array.isArray(extraFields) ? [...extraFields] : [];
    if (!fields.includes('last_active_date')) {
      fields.push('last_active_date');
    }

    return original.call(userUtil, fields, ...args);
  });

  /**
   * Remember which friends are inactive. The friend the selector was opened for is never hidden.
   *
   * @param {Function} original      The game's formatFriendData.
   * @param {Array}    rawFriendData The friends to group.
   *
   * @return {Array} The friend groups, unchanged.
   */
  overrideWhileEnabled(MODULE_ID, view, 'formatFriendData', (original, rawFriendData) => {
    const groups = original.call(view, rawFriendData);

    inactiveSnuids = new Set();
    for (const group of groups) {
      if ('highlighted' === group.type) {
        continue;
      }

      for (const friend of group.friends) {
        if (isInactive(friend)) {
          inactiveSnuids.add(String(friend.snuid));
        }
      }
    }

    return groups;
  });

  /**
   * Mark inactive friends after the game finishes rendering or re-filtering the list.
   *
   * @param {Function} original The game's filterFriends.
   * @param {...*}     args     The filterFriends arguments.
   *
   * @return {*} The game's return value.
   */
  overrideWhileEnabled(MODULE_ID, view, 'filterFriends', (original, ...args) => {
    const result = original.apply(view, args);
    applyToList();
    return result;
  });

  /**
   * Start each visit to the selector with inactive friends hidden again.
   *
   * @param {Function} original The game's show.
   * @param {...*}     args     The show arguments.
   *
   * @return {*} The game's return value.
   */
  overrideWhileEnabled(MODULE_ID, view, 'show', (original, ...args) => {
    showInactive = false;
    return original.apply(view, args);
  });

  document.addEventListener('click', onToggleClick);
};

export default hideInactiveFriends;
