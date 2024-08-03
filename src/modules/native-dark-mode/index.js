import { addBodyClass, addExternalStyles, addStyles, onNavigation } from '@utils';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Add the dark mode styles.
 */
const init = async () => {
  addStyles(styles, 'native-dark-mode');
  addExternalStyles('dark-mode-mice-images.css');

  addBodyClass('mh-dark');

  onNavigation(() => {
    addBodyClass('mh-dark');
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'native-dark-mode',
  name: 'Native Dark Mode',
  description: 'Disable the Dark Mode extension/MHCT setting to prevent conflicts.',
  type: 'beta',
  default: false,
  load: init,
};
