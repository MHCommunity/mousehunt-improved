import { addStyles, onEvent, onNavigation } from '@utils';

import styles from './styles.css';

/**
 * Move the codex to the bottom of the trap selector.
 */
const moveCodex = async () => {
  const codex = document.querySelector('.trapSelectorView__activeCodexContainer');
  const statsContainer = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
  if (codex && statsContainer) {
    statsContainer.append(codex);
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'codex-at-bottom');
  moveCodex();
  onNavigation(moveCodex, {
    page: 'camp',
  });
  onEvent('mh-improved-cre-list-rendered', moveCodex);
};

export default {
  id: 'codex-at-bottom',
  name: 'Codex at Bottom',
  type: 'feature',
  default: false,
  description: 'Move the codex to the bottom of the trap selector.',
  load: init,
};
