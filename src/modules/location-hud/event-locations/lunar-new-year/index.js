import { addStyles } from '@utils';

import styles from './styles.css';

// Always active.
const lunarNewYearGlobal = async () => {
  addStyles(styles, 'location-hud-events-lunar-new-year');
};

// Only active at the locations.
const lunarNewYearLocation = async () => {
  // no-op.
};

export {
  lunarNewYearGlobal,
  lunarNewYearLocation
};
