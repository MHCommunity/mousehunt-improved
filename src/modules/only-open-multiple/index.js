import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'only-open-multiple');
};

export default {
  id: 'only-open-multiple',
  name: 'Inventory - Only Open multiple',
  type: 'feature',
  default: false,
  description: 'Lock opening things in your inventory unless you have multiple of them.',
  load: init,
};
