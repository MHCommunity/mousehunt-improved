import { addHudStyles } from '@/utils';
import folkloreForest from '../shared/folklore-forest';

import regionStyles from '../shared/folklore-forest/styles.css';
import styles from './styles.css';

export default () => {
  addHudStyles([regionStyles, styles]);

  folkloreForest();
};
