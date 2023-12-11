import { addUIStyles } from '@/utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addUIStyles(styles);
};

export default {
  id: 'only-open-multiple',
  name: 'Inventory - Only open multiple',
  type: 'feature',
  default: false,
  description: 'Lock opening things in your inventory unless you have multiple of them.',
  load: init,
};
