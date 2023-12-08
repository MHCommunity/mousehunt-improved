import friends from './friends';
import hud from './hud';
import inputs from './inputs';
import skins from './skins';
import styles from './styles';

export default () => {
  styles();
  friends();
  hud();
  inputs();
  skins();
};
