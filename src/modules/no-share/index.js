import { addStyles } from '@utils';

import styles from './styles.css';

import socialNoop from '@/shared/social';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  socialNoop();
};

export default {
  id: 'no-share',
  name: 'Hide Share Buttons',
  type: 'element-hiding',
  default: false,
  description: 'Hides the share buttons.',
  load: init,
};
