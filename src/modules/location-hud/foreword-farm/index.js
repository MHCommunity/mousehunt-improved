import { addHudStyles } from '../../utils';
import sharedStyles from '../shared-folklore-forest.css';
import styles from './styles.css';

export default () => {
  addHudStyles('foreward-farm', `${styles}\n${sharedStyles}`);
};
