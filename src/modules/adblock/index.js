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
  type: 'hide-simplify',
  default: false,
  description: 'Hide ads for Feedback Friday, the mobile apps, and more.',
  liveToggle: true,
  load: init,
};
