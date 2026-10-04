import { addModuleBodyClass, addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'no-footer');
  addModuleBodyClass('no-footer', 'no-footer');
};

/**
 * Initialize the module.
 */
export default {
  id: 'no-footer',
  name: 'Hide Footer',
  type: 'personalization',
  default: false,
  liveToggle: true,
  load: init,
};
