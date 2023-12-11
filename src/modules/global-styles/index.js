import { addUIStyles } from '@/utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addUIStyles(styles);
};

export default {
  id: 'global-styles',
  type: 'required',
  load: init,
};
