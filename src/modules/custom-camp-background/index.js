import { addSettingPreview, addStyles, getSetting, onNavigation } from '@utils';

import gradients from '@data/backgrounds.json';

import settings from './settings';
import styles from './styles.css';

const addCampBackground = () => {
  const camp = document.querySelector('#mousehuntContainer.PageCamp');
  if (! camp) {
    return;
  }

  const background = getSetting('custom-camp-background-0', 'background-wood');
  if ('default' === background) {
    return;
  }

  if (background.startsWith('background-')) {
    camp.classList.add(background);
    return;
  }

  if (! gradients) {
    return;
  }

  const gradient = gradients.find((g) => g.id === background);
  if (gradient) {
    camp.style.background = gradient.css;
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-camp-background');

  onNavigation(addCampBackground, { page: 'camp' });

  onNavigation(() => {
    addSettingPreview({
      id: 'custom-camp-background',
      selector: '.mh-improved-custom-camp-bg-preview',
      inputSelector: '#mousehunt-improved-settings-design-custom-camp-background select',
      preview: false,
      items: gradients,
    });
  }, {
    page: 'preferences',
    onLoad: true,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-camp-background',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
