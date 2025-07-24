import { addStyles, getSetting } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  if (getSetting('better-journal.highlight-rare-mice', false)) {
    addStyles(styles, 'highlight-rare-mice');
  }
};

export default {
  id: 'better-journal.highlight-rare-mice',
  name: 'Highlight Rare Mice',
  description: 'Highlights rare mice in the journal with a distinct color.',
  load: init,
};
