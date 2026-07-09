import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'hide-codices');
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-codices',
  name: 'Hide Codices',
  type: 'hide-simplify',
  default: false,
  load: init,
};
