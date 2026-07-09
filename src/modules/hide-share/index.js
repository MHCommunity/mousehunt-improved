import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'no-share');

  if (typeof SocialFramework !== 'undefined') {
    SocialFramework.isFriendStreamPostsEnabled = () => false;
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'no-share',
  name: 'Hide Share Buttons',
  type: 'hide-simplify',
  default: true,
  load: init,
};
