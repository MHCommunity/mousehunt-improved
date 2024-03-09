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

import {
  clickMinLuck,
  disarmCharm,
  disarmCheese,
  gotoPage,
  openBlueprint,
  openGifts,
  openInbox,
  openMap,
  openMapInvites,
  openMarketplace,
  openTravelWindow,
  showTem,
  travelToPreviousLocation
} from './actions';

import styles from './styles.css';

const getBaseShortcuts = () => {
  const shortcuts = [
    {
      id: 'help',
      key: '?',
      shiftKey: true,
      description: 'Help',
      action: showHelpPopup,
      category: 'hidden',
    },
    {
      id: 'goto-travel',
      key: 't',
      description: 'Travel',
      action: () => gotoPage('Travel'),
      category: 'navigation',
    },
    {
      id: 'goto-camp',
      key: 'j',
      description: 'Camp',
      action: () => gotoPage('Camp'),
      category: 'navigation',
    },
    {
      id: 'goto-friends',
      key: 'f',
      description: 'Friends',
      action: () => gotoPage('Friends'),
      category: 'navigation',
    },
    {
      id: 'goto-shops',
      key: 's',
      description: 'Shops',
      action: () => gotoPage('Shops'),
      category: 'navigation',
    },
    {
      id: 'goto-profile',
      key: 'p',
      description: 'Your Hunter Profile',
      action: () => gotoPage('HunterProfile'),
      category: 'navigation',
    },
    {
      id: 'goto-send-supplies',
      description: 'Send Supplies',
      action: () => gotoPage('SupplyTransfer'),
      category: 'navigation',
    },
    {
      id: 'goto-scoreboards',
      description: 'Scoreboards',
      action: () => gotoPage('Scoreboards'),
      category: 'navigation',
    },
    {
      id: 'goto-team',
      description: 'Team',
      action: () => gotoPage('Team'),
      category: 'navigation',
    },
    {
      id: 'goto-tournaments',
      description: 'Tournaments',
      action: () => gotoPage('Tournament'),
      category: 'navigation',
    },
    {
      id: 'goto-wiki',
      description: 'Wiki',
      action: () => gotoPage('Wiki'),
      category: 'navigation',
    },
    {
      id: 'goto-marketplace',
      description: 'Open the Marketplace',
      action: openMarketplace,
      category: 'open-dialog',
    },
    {
      id: 'open-inbox',
      description: 'Open the Inbox',
      action: openInbox,
      category: 'open-dialog',
    },
    {
      id: 'open-gifts',
      description: 'Open the Gifts popup',
      action: openGifts,
      category: 'open-dialog',
    },
    {
      id: 'open-map',
      key: 'm',
      description: 'Open your Map',
      action: openMap,
      category: 'open-dialog',
    },
    {
      id: 'open-map-invites',
      key: 'i',
      description: 'Open your Map Invites',
      action: openMapInvites,
      category: 'open-dialog',
    },
    {
      id: 'open-travel-window',
      description: 'Open the Travel Window',
      action: openTravelWindow,
      category: 'open-dialog',
    },
    {
      id: 'change-weapon',
      key: 'w',
      description: 'Change Weapon',
      action: () => openBlueprint('weapon'),
      category: 'trap-setup',
    },
    {
      id: 'change-base',
      key: 'b',
      description: 'Change Base',
      action: () => openBlueprint('base'),
      category: 'trap-setup',
    },
    {
      id: 'change-charm',
      key: 'r',
      description: 'Change Charm',
      action: () => openBlueprint('trinket'),
      category: 'trap-setup',
    },
    {
      id: 'change-cheese',
      key: 'c',
      description: 'Change Cheese',
      action: () => openBlueprint('bait'),
      category: 'trap-setup',
    },
    {
      id: 'change-skin',
      description: 'Change Trap Skin',
      action: () => openBlueprint('skin'),
      category: 'trap-setup',
    },
    {
      id: 'show-tem',
      key: 'e',
      description: 'Show the <abbr title="Trap Effectiveness Meter">TEM</abbr>',
      action: showTem,
      category: 'trap-setup',
    },
    {
      id: 'disarm-cheese',
      description: 'Disarm your Cheese',
      action: disarmCheese,
      category: 'trap-setup',
    },
    {
      id: 'disarm-charm',
      description: 'Disarm your Charm',
      action: disarmCharm,
      category: 'trap-setup',
    },
    {
      id: 'travel-to-previous-location',
      description: 'Travel to previous location',
      action: travelToPreviousLocation,
      category: 'misc',
    },
  ];

  if (hasMiniCRE()) {
    shortcuts.push({
      id: 'show-mini-cre',
      key: 'l',
      description: 'Open Mini CRE',
      action: clickMinLuck,
      category: 'misc',
    });
  }

  return shortcuts;
};

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
    setTimeout(() => {
      savedElement.classList.remove('saved');
    }, 300);
  }
};

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

const isHelpPopupOpen = () => {
  const overlay = getCurrentDialog();
  if (! overlay) {
    return false;
  }

  return 'mh-ui-keyboard-shortcuts-popup' === overlay;
};

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
        <a class="clear">Clear</a>
        <a class="reset">Reset</a>
        <a class="edit">Edit</a>
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

    const startEditing = () => {
      isEditing = true;
      editButton.innerText = 'Cancel';
      shortcut.classList.add('editing');
      shortcutsWrapper.classList.add('editing');
      document.addEventListener('keydown', keypressListener);
    };

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

        setTimeout(() => {
          matchingShortcut.classList.remove('error');
          shortcut.classList.remove('error');
        }, 300);

        return;
      }

      finishEditing(shortcutId, event);
    };

    editButton.addEventListener('click', () => {
      if (isEditing) {
        finishEditing();
      } else {
        startEditing();
      }
    });

    resetButton.addEventListener('click', () => {
      const defaultShortcut = getBaseShortcuts().find((s) => s.id === shortcutId);
      if (! defaultShortcut) {
        return;
      }

      finishEditing(shortcutId, defaultShortcut);
    });

    clearButton.addEventListener('click', () => {
      finishEditing(shortcutId, {
        key: '',
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
      });
    });
  });
};

let isEditing = false;
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

export default {
  id: 'keyboard-shortcuts',
  name: 'Keyboard Shortcuts',
  type: 'feature',
  default: true,
  description: 'Press \'?\' to see and edit the keyboard shortcuts. You can also <a href="#" class="mh-ui-keyboard-shortcuts-edit">edit them here</a>.',
  load: init,
};
