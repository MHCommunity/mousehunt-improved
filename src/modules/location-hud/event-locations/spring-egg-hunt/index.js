import { addStyles } from '@utils';

import styles from './styles.css';

// Always active.
const springEggHuntGlobal = async () => {
  addStyles(styles);
};

// Only active at the locations.
const springEggHuntLocation = async () => {
  // no-op.
};

export {
  springEggHuntGlobal,
  springEggHuntLocation
};
