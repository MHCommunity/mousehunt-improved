import { addUIStyles, persistBodyClass } from '../utils';

import styles from './styles.css';

export default () => {
  addUIStyles(styles);
  persistBodyClass('no-footer');
};
