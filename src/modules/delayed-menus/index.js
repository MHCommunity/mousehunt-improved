import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'delayed-menus');
};

export default {
  id: 'delayed-menus',
  name: 'Delayed Menus',
  type: 'personalization',
  default: true,
  description: 'Add a short delay before menu dropdowns open.',
  liveToggle: true,
  load: init,
};
