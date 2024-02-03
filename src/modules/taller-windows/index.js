import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'taller-windows');
};

export default {
  id: 'taller-windows',
  name: 'Taller Windows',
  type: 'feature',
  default: true,
  description: 'Make popup and dialog windows taller.',
  load: init,
};
