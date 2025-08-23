import { addStyles, getSetting } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  if (getSetting('experiments.trap-background', false)) {
    addStyles(styles, 'trap-background');
  }
};

export default {
  id: 'experiments.trap-background',
  name: 'Better UI: Add background gradient to trap',
  description: 'Add background gradient to your trap.',
  load: init,
};
