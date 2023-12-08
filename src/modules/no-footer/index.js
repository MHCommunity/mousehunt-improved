import { addUIStyles, persistBodyClass } from '@/utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
export default () => {
  addUIStyles(styles);
  persistBodyClass('no-footer');
};
