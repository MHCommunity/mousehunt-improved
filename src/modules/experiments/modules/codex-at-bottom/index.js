import { addStyles, onEvent, onNavigation } from '@utils';

import styles from './styles.css';

/**
 * Move the codex to the bottom of the trap selector.
 */
const moveCodex = async () => {
  const codex = document.querySelector('.trapSelectorView__activeCodexContainer');
  if (! codex) {
    return;
  }

  const statsContainer = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
  if (! statsContainer) {
    return;
  }

  statsContainer.append(codex);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'codex-at-bottom');
  moveCodex();
  onNavigation(moveCodex, {
    page: 'camp',
  });
  onEvent('mh-improved-cre-list-rendered', moveCodex);
};
