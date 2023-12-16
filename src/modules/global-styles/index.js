import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
};

export default {
  id: 'global-styles',
  type: 'required',
  load: init,
};
