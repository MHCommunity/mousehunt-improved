import {
  addStyles,
  getSetting,
  isDarkMode,
  onNavigation,
  onRequest
} from '@utils';

import styles from './styles.css';

/**
 * Check if dark mode is enabled and add the body class if it is.
 *
 * @return {boolean} Whether the body class was added.
 */
const checkForDarkModeAndAddBodyClass = () => {
  if (! isDarkMode()) {
    return false;
  }

  // add the dark mode class to the body
  document.body.classList.add('mh-dark-mode');
  return true;
};

/**
 * Add the dark mode body class.
 */
const addDarkModeBodyClass = () => {
  let added = checkForDarkModeAndAddBodyClass();
  // add a delay to make sure the body class is added before the styles are applied.
  if (! added) {
    setTimeout(() => {
      added = checkForDarkModeAndAddBodyClass();
      if (! added) {
        setTimeout(checkForDarkModeAndAddBodyClass, 1000);
      }
    }, 500);
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  if (getSetting('native-dark-mode', false)) {
    return;
  }

  addStyles(styles, 'dark-mode');

  addDarkModeBodyClass();

  onNavigation(addDarkModeBodyClass);
  onRequest('*', addDarkModeBodyClass);
};

/**
 * Initialize the module.
 */
export default {
  id: 'dark-mode',
  name: 'Dark Mode Updates & Tweaks (MHCT/Dark Mode Extension)',
  type: 'feature',
  default: true,
  description: 'Updates and tweaks to the MHCT/Dark Mode Extension dark mode.',
  load: init,
};
