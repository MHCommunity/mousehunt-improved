import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'hide-codices');
};

export default {
  id: 'hide-codices',
  name: 'Hide Codices',
  type: 'element-hiding',
  default: false,
  description: 'Hide the codices on the trap selector.',
  load: init,
};
