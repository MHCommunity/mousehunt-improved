import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'adblock');
};

/**
 * Initialize the module.
 */
export default {
  id: 'adblock',
  name: 'Adblock',
  type: 'element-hiding',
  default: false,
  description: 'Hide advertisements for Feedback Friday, mobile apps, etc.',
  load: init,
};
