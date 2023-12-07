import { addHudStyles } from '@/utils';

import regionStyles from '../shared/folklore-forest/styles.css';
import styles from './styles.css';

export default () => {
  addHudStyles([regionStyles, styles]);
};
