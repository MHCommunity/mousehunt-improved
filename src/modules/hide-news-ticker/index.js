import { addStyles } from '@utils';

import styles from './styles.css';
/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'hide-news-ticker');
};

export default {
  id: 'hide-news-ticker',
  name: 'Hide News Ticker',
  type: 'element-hiding',
  default: true,
  description: 'Hides the news ticker in the header.',
  load: init,
};
