import styles from './styles.css';
import hudStyles from './hud.css';
import trainStyles from './train.css';

export default () => {
  addStyles(styles, 'mh-ui');
  addStyles(hudStyles, 'mh-ui');
  addStyles(trainStyles, 'mh-ui');
};
