import { addUIStyles } from '../utils';
import styles from './styles.css';
import recipes from './recipes';

export default () => {
  addUIStyles(styles);
  recipes();
};
