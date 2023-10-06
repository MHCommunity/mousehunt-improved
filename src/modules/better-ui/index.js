import styles from './styles';
import friends from './friends';
import hud from './hud';
import mousepage from './mousepage';
import traps from './traps';

export default () => {
  styles();

  friends();
  hud();
  mousepage();
  traps();
};
