import { addHudStyles, addStyles } from '@utils';

import styles from './styles.css';
import stylesGlobal from './global.css';

// Always active.
const springEggHuntGlobal = async () => {
  addStyles(stylesGlobal);
};

// Only active at the locations.
const springEggHuntLocation = async () => {
  addHudStyles(styles);
};

export {
  springEggHuntGlobal,
  springEggHuntLocation
};
