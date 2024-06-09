import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'sticky-popups');
};

export default {
  id: 'sticky-popups',
  name: 'Sticky Popups',
  type: 'beta',
  default: false,
  description: 'Makes popups sticky so they don\'t disappear when you scroll',
  load: init,
};
