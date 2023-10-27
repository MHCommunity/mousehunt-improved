import { getMhuiSetting } from '../utils';
import styles from './styles';
import darkMode from './dark-mode';
import friends from './friends';
import hud from './hud';
import traps from './traps';

export default () => {
  styles();

  if (getMhuiSetting('better-ui-friends-paste-id')) {
    friends();
  }

  darkMode();
  hud();
  traps();
};
