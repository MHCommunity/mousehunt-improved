import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'trap-background');
};

export default {
  id: 'experiments.trap-background',
  name: 'Add background gradient to trap',
  load: init,
};
