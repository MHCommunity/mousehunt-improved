import { addHudStyles, addStyles } from '@utils';

import styles from './styles.css';
import stylesGlobal from './global.css';

/**
 * Always active.
 */
const birthdayGlobal = async () => {
  addStyles(stylesGlobal, 'location-hud-events-birthday');
};

/**
 * Only active at the event location.
 */
const birthdayLocation = async () => {
  addHudStyles(styles);
};

export {
  birthdayGlobal,
  birthdayLocation
};
