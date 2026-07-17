import { addBodyClass, addStyles, onActivation, onDeactivation, removeBodyClass } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'no-footer');
  addBodyClass('no-footer');

  onActivation('no-footer', () => {
    addBodyClass('no-footer');
  });

  onDeactivation('no-footer', () => {
    removeBodyClass('no-footer');
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'no-footer',
  name: 'Hide Footer',
  type: 'hide-simplify',
  default: false,
  load: init,
};
