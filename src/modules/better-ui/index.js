import styles from './styles';
import friends from './friends';
import hud from './hud';
import traps from './traps';

export default () => {
  styles();

  friends();
  hud();
  traps();
};
