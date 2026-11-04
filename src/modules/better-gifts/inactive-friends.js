import { getFlag, getSetting, makeElement, overrideWhileEnabled, saveSetting } from '@utils';

const MODULE_ID = 'better-gifts';
const SORT_SETTING_ID = 'better-gifts.friend-sort';
const INACTIVE_AFTER_DAYS = 30;

const SORT_OPTIONS = [
  { id: 'name', label: 'name' },
  { id: 'active', label: 'last active' },
];

let inactiveSnuids = new Set();
let lastActiveBySnuid = new Map();
let showInactive = false;

/**
 * Get when a friend was last active.
 *
 * The date comes back from the game as "YYYY-MM-DD HH:MM:SS".
 *
 * @param {Object} friend The friend data.
 *
 * @return {number|null} The timestamp, or null when the game didn't send a usable date.
 */
const getLastActive = (friend) => {
  const date = friend?.last_active_date;
  if (!date) {
    return null;
  }

  const lastActive = new Date(String(date).replace(' ', 'T')).getTime();
  return Number.isNaN(lastActive) ? null : lastActive;
};

/**
 * Whether a friend's last activity is more than a month ago. Friends without a date are kept.
 *
 * @param {number|null} lastActive The friend's last active timestamp.
 *
 * @return {boolean} Whether the friend is inactive.
 */
const isInactive = (lastActive) => null !== lastActive && Date.now() - lastActive > INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000;

/**
 * Get the current sort for the All Friends group.
 *
 * @return {string} The sort ID.
 */
const getSort = () => {
  const sort = getSetting(SORT_SETTING_ID, 'name');
  return SORT_OPTIONS.some((option) => option.id === sort) ? sort : 'name';
};

/**
 * Compare two friend tiles by the game's own (name) order.
 *
 * @param {HTMLElement} a The first friend tile.
 * @param {HTMLElement} b The second friend tile.
 *
 * @return {number} The sort order.
 */
const byName = (a, b) => Number(a.dataset.mhOrder) - Number(b.dataset.mhOrder);

/**
 * Reorder the All Friends tiles in place, so the game's grid is untouched.
 *
 * @param {HTMLElement} list The friend list container.
 */
const sortAllFriends = (list) => {
  // The game appends the tiles straight to the group, after the title and the empty-state box.
  const group = list.querySelector('.giftSelectorView-friend-group.default');
  if (!group) {
    return;
  }

  const friends = [...group.querySelectorAll(':scope > .giftSelectorView-friend')];

  // Remember the game's own order (by name) so it can be restored.
  friends.forEach((friend, index) => {
    if (!friend.dataset.mhOrder) {
      friend.dataset.mhOrder = index;
    }
  });

  const byActive = (a, b) => {
    const diff = (lastActiveBySnuid.get(String(b.dataset.snuid)) ?? 0) - (lastActiveBySnuid.get(String(a.dataset.snuid)) ?? 0);
    return diff || byName(a, b);
  };

  friends.sort('active' === getSort() ? byActive : byName);
  group.append(...friends);
};

/**
 * Add the sort links to the All Friends title.
 *
 * @param {HTMLElement} list The friend list container.
 */
const addSortLinks = (list) => {
  const title = list.querySelector('.giftSelectorView-friend-group.default .giftSelectorView-friend-group-title');
  if (!title) {
    return;
  }

  let wrapper = title.querySelector('.mh-gift-friend-sort');
  if (!wrapper) {
    wrapper = makeElement('span', 'mh-gift-friend-sort', 'Sort by ');
    SORT_OPTIONS.forEach((option, index) => {
      if (index) {
        wrapper.append(' · ');
      }

      const link = makeElement('a', 'mh-gift-friend-sort-option', option.label);
      link.href = '#';
      link.dataset.sort = option.id;
      wrapper.append(link);
    });

    title.append(wrapper);
  }

  const sort = getSort();
  wrapper.querySelectorAll('.mh-gift-friend-sort-option').forEach((link) => {
    link.classList.toggle('active', link.dataset.sort === sort);
  });
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

  const enabled = !getFlag('better-gifts-show-inactive-friends');
  let count = 0;

  list.querySelectorAll('.giftSelectorView-friend[data-snuid]').forEach((friend) => {
    const inactive = enabled && inactiveSnuids.has(String(friend.dataset.snuid));
    friend.classList.toggle('mh-gift-inactive', inactive);
    if (inactive) {
      count++;
    }
  });

  list.classList.toggle('mh-gift-show-inactive', showInactive);

  addSortLinks(list);
  sortAllFriends(list);

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
  const toggle = makeElement('a', 'mh-gift-inactive-toggle', showInactive ? 'Hide' : 'Show');
  toggle.href = '#';
  title.append(toggle);

  // The game appends each group as it finishes rendering, so move the note back to the end.
  list.append(note);
};

/**
 * Handle the show/hide link and the sort links.
 *
 * @param {Event} event The click event.
 */
const onListClick = (event) => {
  const sortLink = event.target.closest('.mh-gift-friend-sort-option');
  if (sortLink) {
    event.preventDefault();
    saveSetting(SORT_SETTING_ID, sortLink.dataset.sort);
    applyToList();
    return;
  }

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
   * Remember when each friend was last active. The friend the selector was opened for is never hidden.
   *
   * @param {Function} original      The game's formatFriendData.
   * @param {Array}    rawFriendData The friends to group.
   *
   * @return {Array} The friend groups, unchanged.
   */
  overrideWhileEnabled(MODULE_ID, view, 'formatFriendData', (original, rawFriendData) => {
    const groups = original.call(view, rawFriendData);

    inactiveSnuids = new Set();
    lastActiveBySnuid = new Map();
    for (const group of groups) {
      for (const friend of group.friends) {
        const lastActive = getLastActive(friend);
        if (null !== lastActive) {
          lastActiveBySnuid.set(String(friend.snuid), lastActive);
        }

        if ('highlighted' !== group.type && isInactive(lastActive)) {
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

  document.addEventListener('click', onListClick);
};

export default hideInactiveFriends;
