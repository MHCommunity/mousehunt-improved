import { addHudStyles, addStyles } from '@utils';

import styles from './styles.css';
import stylesGlobal from './global.css';

// Always active.
const birthdayGlobal = async () => {
  addStyles(stylesGlobal);
};

// Only active at the locations.
const birthdayLocation = async () => {
  addHudStyles(styles);
};

export {
  birthdayGlobal,
  birthdayLocation
};
