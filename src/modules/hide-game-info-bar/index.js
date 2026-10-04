import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'hide-game-info-bar');
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-game-info-bar',
  name: 'Hide Game Info Bar',
  type: 'personalization',
  default: false,
  description: 'Hide the Hunters Online and Friends Online bar above the HUD.',
  liveToggle: true,
  load: init,
};
