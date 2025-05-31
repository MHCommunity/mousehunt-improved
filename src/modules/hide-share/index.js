import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'no-share');

  SocialFramework.isFriendStreamPostsEnabled = () => false;
};

/**
 * Initialize the module.
 */
export default {
  id: 'no-share',
  name: 'Hide Share Buttons',
  type: 'element-hiding',
  default: true,
  description: 'Hide the share buttons.',
  load: init,
};
