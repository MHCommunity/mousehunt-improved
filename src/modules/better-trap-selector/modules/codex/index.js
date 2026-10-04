import { addStyles, getSetting } from '@utils';

import moveCodexToBottom from './at-bottom';

import hiddenStyles from './hidden.css';

/**
 * Initialize the codex position.
 */
export default () => {
  const position = getSetting('better-trap-selector.codex-position-0', 'bottom');

  if ('hidden' === position) {
    addStyles(hiddenStyles, 'better-trap-selector-hide-codex');
  } else if ('bottom' === position) {
    moveCodexToBottom();
  }
};
