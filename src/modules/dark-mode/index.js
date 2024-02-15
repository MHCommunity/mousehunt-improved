import { addStyles, onNavigation, onRequest } from '@utils';

import styles from './styles.css';

/**
 * Check if dark mode is enabled.
 *
 * @return {boolean} True if dark mode is enabled, false otherwise.
 */
const isDarkMode = () => {
  return !! getComputedStyle(document.documentElement).getPropertyValue('--mhdm-white');
};

const checkForDarkModeAndAddBodyClass = () => {
  if (! isDarkMode()) {
    return false;
  }

  // add the dark mode class to the body
  document.body.classList.add('mh-dark-mode');
  return true;
};

const addDarkModeBodyClass = () => {
  let added = checkForDarkModeAndAddBodyClass();
  // add a delay to make sure the body class is added before the styles are applied.
  if (! added) {
    setTimeout(() => {
      added = checkForDarkModeAndAddBodyClass();
      if (! added) {
        setTimeout(() => {
          checkForDarkModeAndAddBodyClass();
        }, 1000);
      }
    }, 500);
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'dark-mode');

  addDarkModeBodyClass();

  onNavigation(addDarkModeBodyClass);
  onRequest('*', addDarkModeBodyClass);
};

export default {
  id: 'dark-mode',
  name: 'Dark Mode Updates & Tweaks',
  type: 'feature',
  default: true,
  description: 'Improves and tweaks dark mode, either the standalone extension or the MHCT version.',
  load: init,
};
