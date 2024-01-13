import { addHudStyles, addStyles } from '@utils';

import styles from './styles.css';
import stylesGlobal from './global.css';

// Always active.
const lunarNewYearGlobal = async () => {
  addStyles(stylesGlobal);
};

// Only active at the locations.
const lunarNewYearLocation = async () => {
  addHudStyles(styles);
};

export {
  lunarNewYearGlobal,
  lunarNewYearLocation
};
