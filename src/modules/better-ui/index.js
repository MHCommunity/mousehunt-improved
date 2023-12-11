import friends from './friends';
import hud from './hud';
import inputs from './inputs';
import skins from './skins';
import styles from './styles';

/**
 * Initialize the module.
 */
const init = () => {
  styles();
  friends();
  hud();
  inputs();
  skins();
};

export default {
  id: 'better-ui',
  name: 'Better UI',
  type: 'better',
  default: true,
  description: 'Updates the MH interface with a variety of UI and style changes.',
  load: init,
};
