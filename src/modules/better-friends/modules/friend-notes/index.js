import { addStyles, getCurrentPage, getSetting, makeElement, makeMhButton, onEvent, onNavigation, onRequest, saveSetting } from '@utils';

import styles from './styles.css';

const SETTING_KEY = 'better-friends.notes';
const MAX_NOTE_LENGTH = 500;

/**
 * Get every saved note, keyed by snuid.
 *
 * @return {Object} The saved notes.
 */
const getNotes = () => {
  const notes = getSetting(SETTING_KEY, {});
  return notes && 'object' === typeof notes ? notes : {};
};

/**
 * Get the note for a hunter.
 *
 * @param {string} snuid The hunter's snuid.
 *
 * @return {string} The note, or an empty string.
 */
const getNote = (snuid) => {
  if (!snuid) {
    return '';
  }

  const entry = getNotes()[String(snuid)];
  return entry && 'string' === typeof entry.note ? entry.note : '';
};

/**
 * Save or remove the note for a hunter.
 *
 * @param {string} snuid         The hunter's snuid.
 * @param {string} note          The note text. An empty note removes the entry.
 * @param {Object} meta          Details about the hunter, kept for reference.
 * @param {string} meta.name     The hunter's name.
 * @param {string} meta.hunterId The hunter's ID.
 */
const setNote = (snuid, note, { name = '', hunterId = '' } = {}) => {
  const notes = getNotes();
  const key = String(snuid);
  const text = String(note || '')
    .trim()
    .slice(0, MAX_NOTE_LENGTH);

  if (text) {
    notes[key] = { note: text, name, hunterId, updated: Date.now() };
  } else {
    delete notes[key];
  }

  saveSetting(SETTING_KEY, notes);
};

/**
 * Pull the snuid out of a rendered friend row.
 *
 * @param {HTMLElement} row The friend row.
 *
 * @return {string|null} The snuid.
 */
const getRowSnuid = (row) => {
  const buttons = row.querySelector('[data-recipient-snuid]');
  if (buttons?.dataset.recipientSnuid) {
    return buttons.dataset.recipientSnuid;
  }

  const link = row.querySelector('a[href*="snuid="]');
  if (!link) {
    return null;
  }

  try {
    return new URL(link.getAttribute('href'), location.origin).searchParams.get('snuid');
  } catch {
    return null;
  }
};

/**
 * Show a hunter's note on a friend row, or take it off if the note is gone.
 *
 * @param {HTMLElement} row The friend row.
 */
const decorateFriendRow = (row) => {
  const snuid = getRowSnuid(row);
  const note = getNote(snuid);
  const existing = row.querySelector('.mh-friend-note-row');

  row.classList.toggle('mh-has-friend-note', Boolean(note));

  if (!note) {
    existing?.remove();
    return;
  }

  const noteRow = existing || makeElement('div', 'mh-friend-note-row');
  noteRow.textContent = note;
  noteRow.title = note;

  if (!existing) {
    const content = row.querySelector('.friendsPage-friendRow-content') || row;
    const stats = content.querySelector('.friendsPage-friendRow-statsContainer');
    if (stats) {
      stats.before(noteRow);
    } else {
      content.append(noteRow);
    }
  }
};

/**
 * Decorate the friend rows inside a container.
 *
 * @param {HTMLElement|Document} root The container to look in.
 */
const decorateFriendRows = (root = document) => {
  root.querySelectorAll('.friendsPage-friendList-content .friendsPage-friendRow').forEach(decorateFriendRow);
};

/**
 * Show the note under the hover profile as its own bar.
 */
const decorateHoverProfile = () => {
  const panel = document.querySelector('#friend-data-wrapper');
  if (!panel) {
    return;
  }

  panel.querySelectorAll('.mh-friend-note-hover').forEach((el) => el.remove());

  const row = panel.querySelector('.friendsPage-friendRow');
  const note = row ? getNote(getRowSnuid(row)) : '';
  if (!note) {
    return;
  }

  // The clamp goes on an inner element so the bar's padding doesn't show a sliver of a fourth line.
  const bar = makeElement('div', 'mh-friend-note-hover');
  const text = makeElement('div', 'mh-friend-note-hover-text');
  text.textContent = note;
  bar.title = note;
  bar.append(text);
  panel.append(bar);
};

/**
 * Add the hunter's note to a Quick Send panel opened from a map hunter.
 *
 * @param {HTMLElement} panel The Quick Send panel.
 */
const decorateQuickSendPanel = (panel) => {
  if (!panel.classList.contains('quickSendWrapper-map') || panel.querySelector('.mh-friend-note-quick-send')) {
    return;
  }

  const note = getNote(panel.dataset.snuid);
  if (!note) {
    return;
  }

  const bar = makeElement('div', 'mh-friend-note-quick-send');
  bar.textContent = note;
  bar.title = note;
  panel.append(bar);
};

/**
 * Watch for Quick Send panels, which are added to the body when a hunter is hovered.
 */
const watchQuickSendPanels = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element && node.classList.contains('quickSendWrapper')) {
          decorateQuickSendPanel(node);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true });
};

let friendsObserver = null;
let friendsDecorateTimer = 0;

/**
 * Keep the Friends page rows decorated as the game re-renders them when sorting, filtering, or paging.
 */
const watchFriendsPage = () => {
  friendsObserver?.disconnect();
  friendsObserver = null;

  decorateFriendRows();

  // The search box may already be built if the friend list loaded before we did.
  patchFriendSearch();

  const container = document.querySelector('#mousehuntContainer');
  if (!container) {
    return;
  }

  friendsObserver = new MutationObserver((mutations) => {
    const hasRows = mutations.some((mutation) =>
      [...mutation.addedNodes].some((node) => node instanceof Element && (node.classList.contains('friendsPage-friendRow') || node.querySelector('.friendsPage-friendRow')))
    );

    if (!hasRows) {
      return;
    }

    clearTimeout(friendsDecorateTimer);
    friendsDecorateTimer = setTimeout(() => decorateFriendRows(), 0);
  });

  friendsObserver.observe(container, { childList: true, subtree: true });
};

/**
 * Stop watching the Friends page once it's gone.
 */
const unwatchFriendsPage = () => {
  if ('friends' === getCurrentPage()) {
    return;
  }

  friendsObserver?.disconnect();
  friendsObserver = null;
};

/**
 * Teach the Friends page search to match notes too.
 *
 * The game rebuilds the search box each time it loads the sortable friend list, so this runs after each load
 * and again when the page opens, in case the list loaded first.
 *
 * @param {number} attempt The retry count while the game finishes building the search box.
 */
const patchFriendSearch = (attempt = 0) => {
  if ('undefined' === typeof $) {
    return;
  }

  const selects = document.querySelectorAll('.friendsPage-friendListContainer select[data-filter-type="snuid"]');
  let needsRetry = false;

  selects.forEach((select) => {
    const select2 = $(select).data('select2');
    if (!select2?.opts) {
      needsRetry = true;
      return;
    }

    const opts = select2.opts;
    if (opts.mhFriendNotes) {
      return;
    }

    const originalMatcher = opts.matcher;

    /**
     * Match on the hunter's name like the game does, or on their note.
     *
     * @param {string} term   The search term.
     * @param {string} text   The option text.
     * @param {Object} option The option element.
     *
     * @return {boolean} Whether the option matches.
     */
    opts.matcher = (term, text, option) => {
      if ('function' === typeof originalMatcher && originalMatcher(term, text, option)) {
        return true;
      }

      const snuid = option?.val ? option.val() : option?.value;
      const note = getNote(snuid);
      return Boolean(note) && note.toLowerCase().includes(String(term || '').toLowerCase());
    };

    opts.mhFriendNotes = true;
  });

  if (needsRetry && attempt < 20) {
    setTimeout(() => patchFriendSearch(attempt + 1), 250);
  }
};

/**
 * Get the snuid of the hunter whose profile is open.
 *
 * @return {string|null} The snuid, or null on our own profile.
 */
const getProfileSnuid = () => {
  if (document.querySelector('.friendsProfileView-selfStats')) {
    return null;
  }

  const action = document.querySelector('.hunterInfoView-friendsBlock [data-recipient-snuid]');
  if (action?.dataset.recipientSnuid) {
    return action.dataset.recipientSnuid;
  }

  const fromUrl = new URLSearchParams(location.search).get('snuid');
  if (fromUrl && fromUrl !== user?.sn_user_id) {
    return fromUrl;
  }

  return null;
};

/**
 * Render the note editor into the note block.
 *
 * @param {HTMLElement} block    The note block.
 * @param {string}      snuid    The hunter's snuid.
 * @param {Object}      meta     Details about the hunter.
 * @param {Function}    rerender Re-render the profile's note, with `true` to keep editing.
 */
const renderNoteEditor = (block, snuid, meta, rerender) => {
  const note = getNote(snuid);
  block.classList.add('mh-friend-note-editing');

  const textarea = makeElement('textarea', 'mh-friend-note-input');
  textarea.value = note;
  textarea.maxLength = MAX_NOTE_LENGTH;
  textarea.rows = 3;
  textarea.placeholder = 'Only you can see this note';
  block.append(textarea);

  const actions = makeElement('div', 'mh-friend-note-actions');
  block.append(actions);

  /**
   * Save the note and go back to showing it.
   */
  const save = () => {
    setNote(snuid, textarea.value, meta);
    rerender();
  };

  makeMhButton({ text: 'Save', size: 'tiny', className: 'mh-friend-note-save', callback: save, appendTo: actions });

  const cancel = makeElement('a', 'mh-friend-note-cancel', 'Cancel');
  cancel.href = '#';
  cancel.addEventListener('click', (event) => {
    event.preventDefault();
    rerender();
  });
  actions.append(cancel);

  if (note) {
    const remove = makeElement('a', 'mh-friend-note-remove', 'Remove');
    remove.href = '#';
    remove.addEventListener('click', (event) => {
      event.preventDefault();
      setNote(snuid, '', meta);
      rerender();
    });
    actions.append(remove);
  }

  textarea.addEventListener('keydown', (event) => {
    if ('Enter' === event.key && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      save();
    } else if ('Escape' === event.key) {
      event.preventDefault();
      rerender();
    }
  });
};

/**
 * Render the saved note into the note block.
 *
 * @param {HTMLElement} block    The note block.
 * @param {string}      note     The note.
 * @param {Function}    rerender Re-render the profile's note, with `true` to start editing.
 */
const renderNoteView = (block, note, rerender) => {
  const header = makeElement('div', 'mh-friend-note-header');
  makeElement('span', 'mh-friend-note-label', 'Note', header);

  const edit = makeElement('a', 'mh-friend-note-edit', 'Edit');
  edit.href = '#';
  edit.addEventListener('click', (event) => {
    event.preventDefault();
    rerender(true);
  });
  header.append(edit);
  block.append(header);

  // The note is free text, so add it as text rather than HTML.
  const text = makeElement('div', 'mh-friend-note-text');
  text.textContent = note;
  block.append(text);
};

/**
 * Add the note to a hunter's profile.
 *
 * A saved note shows in a block under the ID card. Without one, there's just an "Add a note"
 * pill next to the Hunter ID, and the block only appears while editing.
 */
const addProfileNote = () => {
  const idCard = document.querySelector('.hunterInfoView-left .hunterInfoView-idCardBlock');
  if (!idCard) {
    return;
  }

  const snuid = getProfileSnuid();
  if (!snuid) {
    return;
  }

  const meta = {
    name: idCard.querySelector('.friendsPage-friendRow-titleBar-name')?.textContent.trim() || '',
    hunterId: idCard.dataset.userId || '',
  };

  /**
   * Render the note's current state.
   *
   * @param {boolean} editing Whether to show the editor.
   */
  const render = (editing = false) => {
    document.querySelectorAll('.mh-friend-note, .mh-friend-note-add').forEach((el) => el.remove());

    const note = getNote(snuid);
    if (!note && !editing) {
      const add = makeElement('a', 'mh-friend-note-add', 'Add a note');
      add.href = '#';
      add.addEventListener('click', (event) => {
        event.preventDefault();
        render(true);
      });

      const header = idCard.querySelector('.hunterInfoView-idCardBlock-secondaryHeader');
      if (header) {
        header.prepend(add);
      }

      return;
    }

    const block = makeElement('div', 'mh-friend-note');
    if (editing) {
      renderNoteEditor(block, snuid, meta, render);
    } else {
      renderNoteView(block, note, render);
    }

    idCard.after(block);

    // Focus once the editor is in the page, so typing goes to the note instead of keyboard shortcuts.
    const textarea = block.querySelector('.mh-friend-note-input');
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  };

  render();
};

/**
 * Initialize the feature.
 */
export default () => {
  addStyles(styles, 'friend-notes');

  onNavigation(addProfileNote, { page: 'hunterprofile' });

  onNavigation(watchFriendsPage, { page: 'friends' });
  onNavigation(unwatchFriendsPage, { onLoad: false });

  onRequest('pages/friends.php', (response, data) => {
    if ('get_sortable_friend_data' === data?.action) {
      setTimeout(() => patchFriendSearch(), 0);
    }
  });

  onEvent('profile_hover', decorateHoverProfile);
  watchQuickSendPanels();
};

export { getNote, setNote };
