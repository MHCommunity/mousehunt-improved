import { addStyles, getSetting } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  if (
    getSetting('better-journal.full-mice-images-no-border', false) &&
    ! getSetting('native-dark-mode', false) // Doesn't work well with native dark mode.
  ) {
    addStyles(styles, 'full-mice-images-no-border');
  }
};

export default init;
