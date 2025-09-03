import { addHudStyles } from '@utils';
import folkloreForest from '../../shared/folklore-forest';

import regionStyles from '../../shared/folklore-forest/styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([regionStyles]);

  folkloreForest();
};
