import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'taller-windows');
};

/**
 * Initialize the module.
 */
export default {
  id: 'taller-windows',
  name: 'Taller Windows',
  type: 'navigation-utilities',
  default: true,
  load: init,
};
