import { addStyles, getFlag, onNavigation } from '@utils';

import { getLayout } from './blocks';
import { getContainer, saveSnapshot } from './preview';
import openTrapSelectorEditor from './editor';
import settings from './settings';

import largerCodicesStyles from './larger-codices.css';
import styles from './styles.css';

/**
 * Order and hide the trap stat summary blocks with CSS, so it holds up when the game or other
 * modules re-render them.
 */
const applyLayout = () => {
  const css = getLayout().map((block, index) => {
    // A hidden codex is hidden wherever it is, so it doesn't flash before it's moved.
    const selector = 'codex' === block.id ? block.selector : `.trapSelectorView__trapStatSummaryContainer > ${block.selector}`;
    return block.hidden ? `${selector} { display: none !important; }` : `${selector} { order: ${index + 1}; }`;
  });

  addStyles(css.join('\n'), 'custom-trap-selector-layout');
};

/**
 * Move the codex in with the other blocks.
 */
const moveCodex = () => {
  const codex = document.querySelector('.trapSelectorView__activeCodexContainer');
  const container = getContainer();
  if (codex && container && codex.parentElement !== container) {
    container.append(codex);
  }
};

let observer;
let snapshotTimeout;

/**
 * Watch the trap for changes, to move the codex and keep the preview up to date.
 */
const watchTrap = () => {
  observer?.disconnect();

  const trap = document.querySelector('.trapSelectorView__trap');
  if (!trap) {
    return;
  }

  moveCodex();
  saveSnapshot();

  observer = new MutationObserver(() => {
    moveCodex();

    clearTimeout(snapshotTimeout);
    snapshotTimeout = setTimeout(saveSnapshot, 500);
  });
  observer.observe(trap, { childList: true, subtree: true });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-trap-selector');
  applyLayout();

  if (!getFlag('custom-trap-selector-no-larger-codices')) {
    addStyles(largerCodicesStyles, 'custom-trap-selector-larger-codices');
  }

  onNavigation(watchTrap, { page: 'camp' });

  document.addEventListener('click', (event) => {
    if (event.target.closest('.mh-improved-custom-trap-selector-open')) {
      event.preventDefault();
      openTrapSelectorEditor(applyLayout);
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-trap-selector',
  // Sort after Custom Menu, with the other link-only row.
  sortName: 'custom-z-trap-selector',
  type: 'personalization',
  alwaysLoad: true,
  load: init,
  settings,
};
