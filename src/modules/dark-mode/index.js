import { addUIStyles, isDarkMode, onNavigation, onRequest } from '@/utils';

import styles from './styles.css';

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
export default () => {
  addUIStyles(styles);

  addDarkModeBodyClass();

  onNavigation(addDarkModeBodyClass);
  onRequest(addDarkModeBodyClass);
};
