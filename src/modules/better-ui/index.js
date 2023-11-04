import { getMhuiSetting } from '../utils';
import styles from './styles';
import copyId from './copy-id';
import darkMode from './dark-mode';
import friends from './friends';
import hud from './hud';
import prestigeBaseStats from './prestige-base-stats';

export default () => {
  styles();

  if (getMhuiSetting('better-ui-friends-paste-id')) {
    friends();
  }

  if (getMhuiSetting('better-ui-copy-id')) {
    copyId();
  }

  if (getMhuiSetting('better-ui-dark-mode')) {
    darkMode();
  }

  if (getMhuiSetting('better-ui-prestige-base')) {
    prestigeBaseStats();
  }

  // This one is always on.
  hud();
};
