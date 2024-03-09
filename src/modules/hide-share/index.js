import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'no-share');
};

export default {
  id: 'no-share',
  name: 'Hide Share Buttons',
  type: 'element-hiding',
  default: true,
  description: 'Hides the share buttons.',
  load: init,
};
