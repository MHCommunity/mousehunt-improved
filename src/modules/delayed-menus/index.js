import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'delayed-menus');
};

export default {
  id: 'delayed-menus',
  name: 'Delayed Menus',
  type: 'beta',
  default: false,
  description: 'Adds a short delay to the menu dropdowns to prevent accidental clicks',
  load: init,
};
