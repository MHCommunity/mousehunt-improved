import { addStyles, getSetting, onEvent, onNavigation } from '@utils';

import settings from './settings';
import styles from './styles.css';

let addedClass = '';

/**
 * Add a class to the horn view.
 */
const addHornClass = () => {
  const hornView = document.querySelector('.huntersHornView');
  if (!hornView) {
    return;
  }

  const horn = document.querySelector('.huntersHornView__horn');
  if (!horn) {
    return;
  }

  const setting = getSetting('custom-horn-0', 'default');

  if ('default' !== setting) {
    const classes = [...hornView.classList];
    classes.forEach((className) => {
      if (className.includes('--seasonalEvent-')) {
        hornView.classList.remove(className);
      }
    });
  }

  horn.classList.add('huntersHornView__horn--default');

  if (addedClass) {
    hornView.classList.remove(addedClass);
    addedClass = '';
  }

  if ('default' !== setting) {
    hornView.classList.add(setting);
    addedClass = setting;
  }
};

/**
 * Persist the horn class changes when navigating.
 */
const persistHornClass = () => {
  addHornClass();
  onNavigation(() => {
    setTimeout(addHornClass, 1000);
  });

  onEvent('mh-improved-settings-changed', ({ key }) => {
    if ('custom-horn-0' === key) {
      addHornClass();
    }
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-horn');

  persistHornClass();
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-horn',
  type: 'personalization',
  alwaysLoad: true,
  load: init,
  settings,
};
