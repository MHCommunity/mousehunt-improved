import { addUIStyles } from '../../utils';
import styles from './styles.css';
import betterLuckyCatchIcon from './better-lucky-catch-icon.css';
import hudStyles from './hud.css';
import trainStyles from './train.css';

export default () => {
  const combined = [styles, betterLuckyCatchIcon, hudStyles, trainStyles].join('\n');
  addUIStyles(styles);
};
