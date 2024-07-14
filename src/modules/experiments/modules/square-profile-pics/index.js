import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'consistent-profile-pics');
};

export default {
  id: 'experiments.consistent-profile-pics',
  name: 'Make all profile pictures square',
  load: init,
};
