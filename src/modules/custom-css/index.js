import { addModuleStyles, getSetting, onEvent } from '@utils';

import settings from './settings';

const stylesId = 'mh-improved-styles-mousehunt-improved-override-styles';

/**
 * Apply the saved custom CSS to the page.
 *
 * @param {string} customStyles The custom CSS to apply.
 */
const applyCustomStyles = (customStyles = getSetting('override-styles')) => {
  const existingStyles = document.querySelector(`#${stylesId}`);
  if (! customStyles) {
    existingStyles?.remove();
    return;
  }

  addModuleStyles(customStyles.replaceAll('\\n', '\n'), stylesId, true);
};

/**
 * Load the custom CSS.
 */
const init = () => {
  onEvent('mh-improved-loaded', () => {
    if (window.location.search.includes('no-custom-styles')) {
      return;
    }

    applyCustomStyles();
  });

  onEvent('mh-improved-settings-changed', ({ key, value }) => {
    if ('override-styles' === key && ! window.location.search.includes('no-custom-styles')) {
      applyCustomStyles(value);
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-css',
  type: 'advanced',
  alwaysLoad: true,
  load: init,
  settings,
};
