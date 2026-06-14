import { addStyles, getFlag, isUserTitleAtLeast } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'fabled-max-title-progress-bar');
};

export default {
  id: 'experiments.fabled-max-title-progress-bar',
  name: 'HUD: Show progress bar at max title',
  description: 'Show the completed title progress bar instead of the max title text.',
  showIf: () => isUserTitleAtLeast('fabled') || getFlag('fake-fabled'),
  load: init,
};
