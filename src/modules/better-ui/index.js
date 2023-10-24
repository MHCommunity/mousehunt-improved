import { getMhuiSetting } from '../utils';
import styles from './styles';
import friends from './friends';
import hud from './hud';
import traps from './traps';

export default () => {
  styles();

  if (getMhuiSetting('better-ui-friends-paste-id')) {
    friends();
  }

  hud();
  traps();
};
