import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
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
  description: 'Hides advertisements for Feedback Friday, mobile apps, news ticker, etc.',
  load: init,
};
