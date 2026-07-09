import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'hide-trap-selector-tooltips');
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-trap-selector-tooltips',
  name: 'Hide Trap Selector Tooltips',
  type: 'hide-simplify',
  default: false,
  description: 'Hide the item description tooltips in the trap selector.',
  load: init,
};
