import { addStyles, getSetting } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  if (
    getSetting('experiments.full-mice-images-no-border', false) &&
    ! getSetting('native-dark-mode', false) // Doesn't work well with native dark mode.
  ) {
    addStyles(styles, 'full-mice-images-no-border');
  }
};

export default {
  id: 'experiments.full-mice-images-no-border',
  name: 'Full Mice Images No Border',
  description: 'Removes the border and attempts to make the image transparent. May have color issues.',
  load: init,
};
