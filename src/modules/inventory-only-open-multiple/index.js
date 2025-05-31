import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'only-open-multiple');
};

/**
 * Initialize the module.
 */
export default {
  id: 'only-open-multiple',
  name: 'Inventory - Only Open Extras',
  type: 'feature',
  default: false,
  description: 'Lock opening items in your inventory unless you have multiples of them.',
  load: init,
};
