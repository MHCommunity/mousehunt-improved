import { addStyles, onEvent, onNavigation } from '@utils';

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
export default async () => {
  addStyles('.trapSelectorView__activeCodexContainer--visible { order: 100; }', 'codex-at-bottom');
  moveCodex();
  onNavigation(moveCodex, {
    page: 'camp',
  });
  onEvent('mh-improved-cre-list-rendered', moveCodex);
};
