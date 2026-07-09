import {
  addSettingPreview,
  addStyles,
  flattenSettingOptions,
  getSetting,
  onEvent,
  onNavigation
} from '@utils';

import gradients from '@data/backgrounds.json';

import settings from './settings';
import styles from './styles.css';

const campBackgroundClasses = [
  'background-black',
  'background-blue',
  'background-blueprint',
  'background-cyan',
  'background-faded',
  'background-green',
  'background-marble',
  'background-pink',
  'background-purple',
  'background-red',
  'background-white',
  'background-wood',
];

// The camp backgrounds are applied to the camp container rather than the preview swatch, so they
// need a standalone background of their own. Keep these in sync with styles.css.
const previewStyles = {
  'background-blueprint': 'url(https://i.mouse.rip/mh-improved/custom-hud/hud-blueprint.png)',
  'background-marble': 'url(https://www.mousehuntgame.com/images/ui/backgrounds/hud_bg_blue_repeating.png)',
  'background-wood': 'url(https://i.mouse.rip/bg-wood.png)',
  'background-black': '#262b33',
  'background-blue': '#bad4ed',
  'background-cyan': '#abdbd3',
  'background-green': '#b4dbb8',
  'background-pink': '#e8c6eb',
  'background-purple': '#d8caf3',
  'background-red': '#f2c7c5',
  'background-white': '#fff',
  'background-faded': '#fff4c5',
};

/**
 * Get every camp background choice as a preview item.
 *
 * @return {Promise<Array>} The preview items.
 */
const getPreviewItems = async () => {
  const theSettings = await settings();

  return flattenSettingOptions(theSettings[0].settings.options).map((option) => ({
    id: option.value,
    name: option.name,
    css: previewStyles[option.value] || gradients.find((gradient) => gradient.id === option.value)?.css,
  }));
};

const addCampBackground = () => {
  const camp = document.querySelector('#mousehuntContainer.PageCamp');
  if (! camp) {
    return;
  }

  camp.classList.remove(...campBackgroundClasses);
  camp.style.removeProperty('background');

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

  // The camp isn't rendered while the preferences page is open, so this only takes effect for
  // someone changing the setting from the camp page itself.
  onEvent('mh-improved-settings-changed', ({ key }) => {
    if ('custom-camp-background-0' === key) {
      addCampBackground();
    }
  });

  onNavigation(() => {
    getPreviewItems().then((items) => {
      addSettingPreview({
        id: 'custom-camp-background',
        selector: '.mh-improved-custom-camp-bg-preview',
        inputSelector: '#mousehunt-improved-settings-custom-camp-background select',
        preview: false,
        items,
      });
    }).catch(() => {
      /* Failed to load camp background settings values */
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
  type: 'appearance',
  alwaysLoad: true,
  load: init,
  settings,
};
