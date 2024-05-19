import { addStyles, getSetting, onNavigation } from '@utils';

import settings from './settings';
import styles from './styles.css';

let addedClass = '';

/**
 * Add a class to the horn view.
 *
 * @param {boolean} preview Whether or not this is a preview.
 */
const addHornClass = (preview = false) => {
  const hornView = document.querySelector('.huntersHornView');
  if (! hornView) {
    return;
  }

  const horn = document.querySelector('.huntersHornView__horn');
  if (! horn) {
    return;
  }

  horn.classList.add('huntersHornView__horn--default');

  let setting = getSetting('custom-horn-0', 'default');
  if (preview) {
    setting = preview;
  }

  hornView.classList.add();

  if (addedClass) {
    hornView.classList.remove(addedClass);
  }

  if ('default' !== setting) {
    hornView.classList.add(setting);
    addedClass = setting;
  }
};

/**
 * Listen for changes to the preference.
 */
const listenForPreferenceChanges = () => {
  const input = document.querySelector('#mousehunt-improved-settings-design-custom-horn select');
  if (! input) {
    return;
  }

  input.addEventListener('change', () => {
    addHornClass();
  });
};

/**
 * Add a preview link to show the horn.
 */
const addPreview = () => {
  const previewLink = document.querySelector('.mh-improved-custom-horn-show-horn');
  if (! previewLink) {
    return;
  }

  let isShowing = false;
  let timeout = null;
  previewLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const horn = document.querySelector('.huntersHornView__horn');
    if (! horn) {
      return;
    }

    const backdrop = document.querySelector('.huntersHornView__backdrop');
    if (! backdrop) {
      return;
    }

    if (isShowing) {
      isShowing = false;
      previewLink.textContent = 'Show Horn';

      clearTimeout(timeout);

      horn.classList.add('huntersHornView__horn--reveal');
      horn.classList.remove('huntersHornView__horn--ready');
      setTimeout(() => {
        backdrop.classList.remove('huntersHornView__backdrop--active');
      }, 400);

      timeout = setTimeout(() => {
        horn.classList.remove('huntersHornView__horn--reveal');
      }, 1000);

      return;
    }

    isShowing = true;
    previewLink.textContent = 'Hide Horn';

    backdrop.classList.add('huntersHornView__backdrop--active');
    horn.classList.add('huntersHornView__horn--ready', 'huntersHornView__horn--reveal');

    clearTimeout(timeout);
  });
};

/**
 * Persist the horn class changes when navigating.
 */
const persistHornClass = () => {
  addHornClass();
  onNavigation(() => {
    setTimeout(addHornClass, 1000);
  });

  onNavigation(() => {
    listenForPreferenceChanges();
    addPreview();
  }, {
    page: 'preferences',
    onLoad: true,
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'custom-horn');

  persistHornClass();
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-horn',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
