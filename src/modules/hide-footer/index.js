import { addBodyClass, addStyles, onActivation, removeBodyClass } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'no-footer');
  addBodyClass('no-footer');

  onActivation('no-footer', () => {
    addBodyClass('no-footer');
  });

  onActivation('no-footer', () => {
    removeBodyClass('no-footer');
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'no-footer',
  name: 'Hide Footer',
  type: 'element-hiding',
  default: false,
  description: 'Hides the footer.',
  load: init,
};
