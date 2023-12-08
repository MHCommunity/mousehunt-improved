import friends from './friends';
import hud from './hud';
import inputs from './inputs';
import skins from './skins';
import styles from './styles';

/**
 * Initialize the module.
 */
export default () => {
  styles();
  friends();
  hud();
  inputs();
  skins();
};
