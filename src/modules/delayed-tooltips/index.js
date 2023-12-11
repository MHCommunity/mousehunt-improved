import { addUIStyles } from '@/utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addUIStyles(styles);
};

export default {
  id: 'delayed-tooltips',
  name: 'Delayed Tooltips',
  type: 'feature',
  default: true,
  description: 'Delays the display of tooltips so that they don\'t appear immediately when you mouse over something.',
  load: init
};
