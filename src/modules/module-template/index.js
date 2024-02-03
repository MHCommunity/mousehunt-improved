import { addStyles } from '@utils';

import settings from './settings';
import styles from './styles.css';

const main = () => {
  // do stuff
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'module-template');

  main();
};

export default {
  id: 'module-template',
  name: 'Module Template',
  type: 'feature',
  default: true,
  description: 'This is a template for creating new modules.',
  load: init,
  settings,
};
