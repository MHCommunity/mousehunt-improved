import { addUIStyles, persistBodyClass } from '@/utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addUIStyles(styles);
  persistBodyClass('no-footer');
};

export default {
  id: 'no-footer',
  name: 'Hide Footer',
  type: 'element-hiding',
  default: false,
  description: 'Hides the footer.',
  load: init,
};
