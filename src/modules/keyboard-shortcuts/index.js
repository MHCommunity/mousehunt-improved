import {
  addStyles,
  createPopup,
  getCurrentDialog,
  getCurrentPage,
  getSetting,
  hasMiniCRE,
  isAppleOS,
  onNavigation,
  saveSetting
} from '@utils';

import actions from './actions';

import styles from './styles.css';

/**
 * Get the default shortcuts.
 *
 * @return {Array} The default shortcuts.
 */
const getBaseShortcuts = () => {
  return [
    {
      id: 'help',
      key: '?',
      shiftKey: true,
      description: 'Help',
      action: showHelpPopup,
      category: 'hidden',
    },
    {
      id: 'horn',
      key: 'h',
      description: 'Sound the Hunter\'s Horn',
      action: () => {},
      category: 'misc',
    },
    {
      id: 'close-popup',
      key: 'Escape',
      description: 'Close the current popup',

      /**
       * Close the current popup.
       */
      action: () => {
        if (activejsDialog && activejsDialog.hide) {
          activejsDialog.hide();
        }
      },
      category: 'hidden',
    },
    ...actions(),
  ];
};

/**
 * Get the shortcuts.
 *
 * @return {Array} The shortcuts.
 */
const getShortcuts = () => {
  const shortcuts = getBaseShortcuts();

  const saved = getSetting('keyboard-shortcuts.shortcuts', []);
  if (! saved || ! saved.length) {
    return shortcuts;
  }

  // Merge the saved shortcuts with the defaults.
  saved.forEach((savedShortcut) => {
    const shortcut = shortcuts.find((s) => s.id === savedShortcut.id);
    if (! shortcut) {
      return;
    }

    shortcut.key = savedShortcut.key;
    shortcut.ctrlKey = savedShortcut.ctrlKey;
    shortcut.metaKey = savedShortcut.metaKey;
    shortcut.altKey = savedShortcut.altKey;
    shortcut.shiftKey = savedShortcut.shiftKey;
  });

  return shortcuts;
};

/**
 * Save a shortcut.
 *
 * @param {string} shortcutId  The ID of the shortcut.
 * @param {Object} shortcutKey The key combination.
 */
const saveShortcut = (shortcutId, shortcutKey) => {
  let saved = getSetting('keyboard-shortcuts.shortcuts', []);

  if (! saved || ! saved.length) {
    saved = [];
  }

  const toSave = {
    id: shortcutId,
    key: shortcutKey.key,
    ctrlKey: shortcutKey.ctrlKey,
    metaKey: shortcutKey.metaKey,
    altKey: shortcutKey.altKey,
    shiftKey: shortcutKey.shiftKey,
  };

  // if the shortcut already exists, then remove it.
  const existingShortcut = saved.find((s) => s.id === shortcutId);
  if (existingShortcut) {
    saved = saved.filter((s) => s.id !== shortcutId);
  }

  // only save the shortcut if it's not the default, its not blank, delete, or backspace, and it's not already in use.
  if (
    toSave.key !== 'Backspace' &&
    toSave.key !== 'Delete' &&
    toSave.key !== ' '
  ) {
    saved.push(toSave);
  }

  saveSetting('keyboard-shortcuts.shortcuts', saved);

  const savedElement = document.querySelector(`.mh-ui-keyboard-shortcut[data-shortcut-id="${shortcutId}"]`);
  if (savedElement) {
    savedElement.classList.add('saved');
    setTimeout(savedElement.classList.remove, 300, 'saved');
  }
};

/**
 * Get the key combination to show in the popup.
 *
 * @param {Object} keyEvent The key event.
 *
 * @return {string} The key combination.
 */
const getKeyForDisplay = (keyEvent) => {
  let keyString = '';

  const keysToShow = [];
  // Show the modifier keys first.
  if (keyEvent.metaKey) {
    keysToShow.push(isAppleOS() ? '⌘' : '⊞');
  }

  if (keyEvent.ctrlKey) {
    keysToShow.push(isAppleOS() ? '⌃' : 'Ctrl');
  }

  if (keyEvent.altKey) {
    keysToShow.push(isAppleOS() ? '⌥' : 'Alt');
  }

  if (keyEvent.shiftKey) {
    keysToShow.push('Shift');
  }

  switch (keyEvent.key) {
  case ' ':
    keysToShow.push('Space');
    break;
  case 'ArrowUp':
    keysToShow.push('↑');
    break;
  case 'ArrowDown':
    keysToShow.push('↓');
    break;
  case 'ArrowLeft':
    keysToShow.push('←');
    break;
  case 'ArrowRight':
    keysToShow.push('→');
    break;
  case 'Backspace':
    // if it's backspace, we want to clear the shortcut.
    keysToShow.push('');
    break;
  default:
    // if its a plain letter, then capitalize it.
    if (keyEvent.key && keyEvent.key.length === 1) {
      keysToShow.push(keyEvent.key.toUpperCase());
    } else {
      keysToShow.push(keyEvent.key);
    }

    break;
  }

  keyString = keysToShow.join('<span class="connector"> + </span>');

  return keyString;
};

/**
 * Check if the help popup is open.
 *
 * @return {boolean} Whether the help popup is open.
 */
const isHelpPopupOpen = () => {
  return 'mh-ui-keyboard-shortcuts-popup' === getCurrentDialog();
};

/**
 * Show the help popup.
 */
const showHelpPopup = () => {
  if (activejsDialog && activejsDialog.hide) {
    // If the popup is already open, close it.
    if (isHelpPopupOpen()) {
      activejsDialog.hide();
      return;
    }

    // Otherwise, close any other popup that might be open and open the help popup.
    activejsDialog.hide();
  }

  const shortcuts = getShortcuts();
  let innerContent = '';

  const categories = [
    {
      id: 'navigation',
      name: 'Page Navigation',
      startOpen: true,
    },
    {
      id: 'open-dialog',
      name: 'Open Dialogs/Popups',
      startOpen: true,
    },
    {
      id: 'trap-setup',
      name: 'Modify Trap Setup',
      startOpen: false,
    },
    {
      id: 'misc',
      name: 'Miscellaneous',
      startOpen: false,
    },
  ];

  categories.forEach((category) => {
    innerContent += `<details class="mh-ui-keyboard-shortcuts-popup-content-category" ${category.startOpen ? 'open' : ''}>
      <summary>${category.name}</summary>
      <div class="mh-ui-keyboard-shortcuts-popup-content-category-description">
        ${category.description || ''}
      </div>
      <div class="mh-ui-keyboard-shortcuts-popup-content-category-list">`;

    const categoryShortcuts = shortcuts.filter((s) => s.category === category.id);

    // Sort the shortcuts by name.
    categoryShortcuts.sort((a, b) => {
      if (a.description < b.description) {
        return -1;
      }

      if (a.description > b.description) {
        return 1;
      }

      return 0;
    });

    categoryShortcuts.forEach((shortcut) => {
      if ('hidden' === shortcut.category) {
        return;
      }

      innerContent += `<div class="mh-ui-keyboard-shortcut" data-shortcut-id="${shortcut.id}">
      <div class="description">${shortcut.description}</div>
      <div class="edit-controls">
        ${'horn' === shortcut.id ? '' : '<a class="clear">Clear</a><a class="reset">Reset</a><a class="edit">Edit</a>'}
      </div>
      <kbd>${getKeyForDisplay(shortcut)}</kbd>
      </div>`;
    });

    innerContent += '</div></details>';
  });

  const content = `<div class="mh-ui-keyboard-shortcuts-popup-content">
    <h2 class="mh-ui-keyboard-shortcuts-edit-content">
      To edit a shortcut, click on <em>Edit</em> on the shortcut, then press the key combination you want to use.
    </h2>
    <div class="mh-ui-keyboard-shortcuts-popup-content-list">
      ${innerContent}
    </div>
  </div>`;

  createPopup({
    title: 'MouseHunt Improved Keyboard Shortcuts',
    content,
    hasCloseButton: true,
    show: true,
    className: 'mh-ui-keyboard-shortcuts-popup',
  });

  const shortcutsWrapper = document.querySelector('.mh-ui-keyboard-shortcuts-popup-content');
  const shortcutButtons = document.querySelectorAll('.mh-ui-keyboard-shortcuts-popup-content-list .mh-ui-keyboard-shortcut');
  shortcutButtons.forEach((shortcut) => {
    const shortcutId = shortcut.getAttribute('data-shortcut-id');
    const editButton = shortcut.querySelector('.edit');
    const resetButton = shortcut.querySelector('.reset');
    const clearButton = shortcut.querySelector('.clear');

    const kbd = shortcut.querySelector('kbd');

    /**
     * Start editing a shortcut.
     */
    const startEditing = () => {
      isEditing = true;
      editButton.innerText = 'Cancel';
      shortcut.classList.add('editing');
      shortcutsWrapper.classList.add('editing');
      document.addEventListener('keydown', keypressListener);
    };

    /**
     * Finish editing a shortcut.
     *
     * @param {string} id  The ID of the shortcut.
     * @param {Object} key The key combination.
     */
    const finishEditing = (id = false, key = false) => {
      isEditing = false;
      editButton.innerText = 'Edit';
      shortcut.classList.remove('editing');
      shortcutsWrapper.classList.remove('editing');
      document.removeEventListener('keydown', keypressListener);

      if (! id || ! key) {
        return;
      }

      saveShortcut(id, key);
      kbd.innerHTML = getKeyForDisplay(key);
    };

    /**
     * Listen for keypresses and save the shortcut.
     *
     * @param {Object} event The key event.
     */
    const keypressListener = (event) => {
      // if the key is alt, shift, ctrl, or meta, by itself, don't do anything, because that's not a valid shortcut by itself.
      // if the key matches the key of another shortcut, show an error message for a second.
      // otherwise, save the shortcut and update the display and remove the event listener.
      if (['Alt', 'Shift', 'Control', 'Meta'].includes(event.key)) {
        return;
      }

      const theShortcut = getShortcuts().find((s) => {
        return (
          s.key === event.key &&
          event.ctrlKey === (s.ctrlKey || false) &&
          event.metaKey === (s.metaKey || false) &&
          event.altKey === (s.altKey || false) &&
          event.shiftKey === (s.shiftKey || false)
        );
      });

      if (theShortcut) {
        // find the shortcut that matches the key and show an error message.
        const matchingShortcut = document.querySelector(`.mh-ui-keyboard-shortcut[data-shortcut-id="${theShortcut.id}"]`);
        if (! matchingShortcut) {
          return;
        }

        // if the shortcut is already the one we're editing, then just finish editing.
        if (shortcutId === theShortcut.id) {
          finishEditing(shortcutId, event);
          return;
        }

        matchingShortcut.classList.add('error');
        shortcut.classList.add('error');

        setTimeout(matchingShortcut.classList.remove, 300, 'error');
        setTimeout(shortcut.classList.remove, 300, 'error');

        return;
      }

      finishEditing(shortcutId, event);
    };

    if (editButton) {
      editButton.addEventListener('click', () => {
        if (isEditing) {
          finishEditing();
        } else {
          startEditing();
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        const defaultShortcut = getBaseShortcuts().find((s) => s.id === shortcutId);
        if (! defaultShortcut) {
          return;
        }

        finishEditing(shortcutId, defaultShortcut);
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        finishEditing(shortcutId, {
          key: '',
          ctrlKey: false,
          metaKey: false,
          altKey: false,
          shiftKey: false,
        });
      });
    }
  });
};

let isEditing = false;

/**
 * Listen for keypresses and check if they match a shortcut.
 */
const listenForKeypresses = () => {
  // If the help popup is closed, then listen for keypresses, unless it's inside an input or textarea or something like that. When a key is pressed, check if it's one of the shortcuts and if so, run the action.
  document.addEventListener('keydown', (event) => {
    if (isHelpPopupOpen() || isEditing || user.has_puzzle) {
      return;
    }

    const tagName = event?.target?.tagName?.toLowerCase();
    if ('input' === tagName || 'textarea' === tagName || 'select' === tagName) {
      return;
    }

    const shortcuts = getShortcuts();
    const shortcut = shortcuts.find((s) => {
      s.ctrlKey = s.ctrlKey || false;
      s.metaKey = s.metaKey || false;
      s.altKey = s.altKey || false;
      s.shiftKey = s.shiftKey || false;

      return (
        s.key === event.key &&
        s.ctrlKey === event.ctrlKey &&
        s.metaKey === event.metaKey &&
        s.altKey === event.altKey &&
        s.shiftKey === event.shiftKey
      );
    });

    if (shortcut && shortcut.action) {
      event.preventDefault();
      event.stopPropagation();

      shortcut.action();
    }
  });
};

/**
 * Check if the user is on the preferences page and open the help popup if they are.
 */
const openFromSettings = () => {
  if ('preferences' !== getCurrentPage()) {
    return;
  }

  const openLink = document.querySelector('.mh-ui-keyboard-shortcuts-edit');
  if (! openLink) {
    return;
  }

  openLink.addEventListener('click', (event) => {
    event.preventDefault();
    showHelpPopup();
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'keyboard-shortcuts');

  listenForKeypresses();

  onNavigation(hasMiniCRE, {
    page: 'camp',
  });

  onNavigation(openFromSettings, {
    page: 'preferences',
    tab: 'mousehunt-improved-settings',
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'keyboard-shortcuts',
  name: 'Keyboard Shortcuts',
  type: 'feature',
  default: true,
  description: 'Press “?” to see and edit keyboard shortcuts. You can also edit them [here](#).',
  load: init,
};
