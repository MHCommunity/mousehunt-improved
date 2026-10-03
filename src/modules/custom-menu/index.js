import { addStyles, onEvent } from '@utils';

import { applyLayout } from './layout';
import openMenuEditor from './editor';
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
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-menu');

  applyLayout();
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
  type: 'appearance',
  alwaysLoad: true,
  load: init,
  settings,
};
