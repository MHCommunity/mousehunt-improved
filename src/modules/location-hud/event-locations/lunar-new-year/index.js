import { addStyles } from '@utils';

import styles from './styles.css';

// Always active.
const lunarNewYearGlobal = async () => {
  addStyles(styles);
};

// Only active at the locations.
const lunarNewYearLocation = async () => {
  // no-op.
};

export {
  lunarNewYearGlobal,
  lunarNewYearLocation
};
