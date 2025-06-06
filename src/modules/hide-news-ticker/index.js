import { addStyles } from '@utils';

import styles from './styles.css';
/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'hide-news-ticker');
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-news-ticker',
  name: 'Hide News Ticker',
  type: 'element-hiding',
  default: true,
  description: 'Hide the news ticker in the header.',
  load: init,
};
