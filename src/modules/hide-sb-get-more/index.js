import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'hide-sb-get-more');
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-sb-get-more',
  name: 'Hide SB+ Get More Label',
  type: 'beta',
  default: false,
  description: 'Hide the "Get More" label next to your SUPER|brie+ count in the menu bar.',
  liveToggle: true,
  load: init,
};
