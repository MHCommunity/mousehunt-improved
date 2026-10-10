import { addStyles, onEvent } from '@utils';

import addAdventureBook from './adventure-book';
import addDarkModeToggle from './dark-mode-toggle';
import addEggHuntHelper from './egg-hunt-helper';
import addHudToggle from './hud-toggle';
import { applyLayout, getContainers } from './layout';
import openMenuEditor, { refreshMenuEditor } from './editor';
import settings from './settings';

import styles from './styles.css';

let applyQueued = false;

/**
 * Apply the layout once the current changes to the menu are done.
 */
const queueApplyLayout = () => {
  if (applyQueued) {
    return;
  }

  applyQueued = true;
  queueMicrotask(() => {
    applyQueued = false;
    applyLayout();
    refreshMenuEditor();
  });
};

/**
 * Apply the layout again if the game adds Hunters Online or Friends Online to the info bar again,
 * so a new count replaces the one that was moved.
 */
const watchInfoBar = () => {
  const { info } = getContainers();
  if (!info) {
    return;
  }

  new MutationObserver(() => {
    if (info.querySelector(':scope > :not([data-mh-menu-id]):is(span, a[href*="friends.php"])')) {
      queueApplyLayout();
    }
  }).observe(info, { childList: true });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-menu');

  addAdventureBook();
  addDarkModeToggle();
  addEggHuntHelper();
  addHudToggle();
  applyLayout();
  watchInfoBar();
  onEvent('mh-improved-header-menu-changed', queueApplyLayout);

  document.addEventListener('click', (event) => {
    if (event.target.closest('.mh-improved-custom-menu-open')) {
      event.preventDefault();

      // Start at the top so the menu being edited is in view behind the popup.
      window.scrollTo({ top: 0 });
      openMenuEditor();
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-menu',
  // Sort after custom-shield so the link-only row doesn't break up the dropdowns.
  sortName: 'custom-z-menu',
  type: 'personalization',
  alwaysLoad: true,
  load: init,
  settings,
};
