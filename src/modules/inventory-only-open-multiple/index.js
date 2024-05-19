import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'only-open-multiple');
};

/**
 * Initialize the module.
 */
export default {
  id: 'only-open-multiple',
  name: 'Inventory - Only Open Multiple',
  type: 'feature',
  default: false,
  description: 'Lock opening things in your inventory unless you have multiple of them.',
  load: init,
};
