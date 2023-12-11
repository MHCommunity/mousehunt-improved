import { addUIStyles } from '@/utils';

import settings from './settings';
import styles from './styles.css';

const main = () => {
  // do stuff
};

/**
 * Initialize the module.
 */
const init = () => {
  addUIStyles(styles);
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
