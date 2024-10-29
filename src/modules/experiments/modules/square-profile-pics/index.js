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
  name: 'Square Profile Pics',
  description: 'Makes profile pictures square in more places for consistency',
  load: init,
};
