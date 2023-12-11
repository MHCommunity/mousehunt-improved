import { addUIStyles } from '@/utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addUIStyles(styles);
};

export default {
  id: 'no-share',
  name: 'Hide Share Buttons',
  type: 'element-hiding',
  default: false,
  description: 'Hides the share buttons.',
  load: init,
};
