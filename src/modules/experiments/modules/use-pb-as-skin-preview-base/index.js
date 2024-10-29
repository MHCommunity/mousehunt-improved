import { addStyles, getSetting } from '@utils';

import styles from './styles.css';
import stylesTrapBackground from './styles-trap-background.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(getSetting('experiments.trap-background', false) ? stylesTrapBackground : styles, 'use-pb-as-skin-preview-base');
};

export default {
  id: 'experiments.use-pb-as-skin-preview-base',
  name: 'Prestige Base in skin previews',
  description: 'Use the Prestige Base when previewing skins',
  load: init,
};
