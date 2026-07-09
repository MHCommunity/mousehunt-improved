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

const eventBackgrounds = 'https://www.mousehuntgame.com/images/ui/backgrounds/events';

/**
 * Build a preview swatch that flanks the event's column art the way the page frame does.
 *
 * @param {string} event      The event's background folder.
 * @param {string} color      The event's background color.
 * @param {string} extension  The image extension.
 * @param {string} filePrefix The prefix on the image filenames.
 *
 * @return {string} The background value for the swatch.
 */
const eventPreview = (event, color, extension = 'png', filePrefix = '') => {
  const image = (side) => `url(${eventBackgrounds}/${event}/${filePrefix}${side}.${extension}) no-repeat ${side} center`;

  return `${image('left')}, ${image('right')}, ${color}`;
};

// The event and color backgrounds are applied to the page frame rather than the body, so the preview
// swatches can't reuse those rules and need a standalone background of their own. The colors here
// come from the game's own `body.<event> .pageFrameView-column` rules.
const previewStyles = {
  birthday: eventPreview('birthday', '#bad4ed'),
  great_winter_hunt: eventPreview('great_winter_hunt', '#bad4ed', 'jpg'),
  halloween: eventPreview('halloween', '#e87e33'),
  kings_giveaway: eventPreview('kings_giveaway', '#7b67aa', 'jpg', 'app_frame_'),
  lunar_new_year: eventPreview('lunar_new_year', '#7f051b'),
  spring_hunt: eventPreview('spring_hunt', '#86ce5c'),
  valentines: eventPreview('valentines', '#f69798'),
  'background-color-blue': '#bad4ed',
  'background-color-cyan': '#abdbd3',
  'background-color-green': '#b4dbb8',
  'background-color-pink': '#e8c6eb',
  'background-color-purple': '#d8caf3',
  'background-color-red': '#f2c7c5',
  'background-color-faded': '#fff4c5',
};

let possibleClasses = [];

/**
 * Add a class to the body.
 *
 * @param {boolean} preview Whether or not this is a preview.
 */
const addBodyClass = (preview = false) => {
  const body = document.querySelector('body');
  if (! body) {
    return;
  }

  let setting = getSetting('custom-background-0', 'default');
  if (preview) {
    setting = preview;
  }

  // remove the old injected style
  const style = document.querySelector('#mh-improved-custom-background-style');
  if (style) {
    style.remove();
  }

  body.classList.remove('mh-improved-custom-background');
  possibleClasses.forEach((className) => {
    body.classList.remove(className, `mh-improved-bg-${className}`);
  });

  if ('default' === setting) {
    return;
  }

  const background = `mh-improved-bg-${setting}`;

  body.classList.add(background);
  if (! setting.startsWith('background-color-')) {
    body.classList.add(setting);
  }

  if (! gradients) {
    return;
  }

  const gradient = gradients.find((g) => g.id === setting);
  if (! gradient) {
    return;
  }

  body.classList.add('mh-improved-custom-background');

  const gradientStyle = document.createElement('style');
  gradientStyle.id = 'mh-improved-custom-background-style';
  gradientStyle.textContent = `.mh-improved-custom-background-gradient-preview,
  body.${background} .pageFrameView-column.right.right,
  body.${background} .pageFrameView-column.left.left {
    background-color: transparent !important;
    background-image: none !important;
  }

  @media only screen and (max-width: 1000px) {
    body.${background}.hasSidebar .pageFrameView,
    body.${background} .pageFrameView-column.right.right,
    body.${background} .pageFrameView-column.left.left {
      background-color: transparent !important;
      background-image: none !important;
    }
  }

  body.${background} {
    background: ${gradient.css};
    background-attachment: fixed;
  }`;

  document.head.append(gradientStyle);
};

/**
 * Get every background choice as a preview item.
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

const addPreview = () => {
  getPreviewItems().then((items) => {
    addSettingPreview({
      id: 'custom-background',
      selector: '.mh-improved-custom-bg-preview',
      inputSelector: '#mousehunt-improved-settings-design-custom-background select',
      items,
      previewCallback: (selected) => addBodyClass(selected),
    });
  }).catch(() => {
    /* Failed to load background settings values */
  });
};

/**
 * Persist the background class.
 */
const persistBackground = () => {
  addBodyClass();
  onNavigation(() => {
    addBodyClass();
    setTimeout(addBodyClass, 250);
    setTimeout(addBodyClass, 500);
  });

  onEvent('mh-improved-settings-changed', ({ key }) => {
    if ('custom-background-0' === key) {
      addBodyClass();
    }
  });

  addPreview();
  onNavigation(addPreview, { page: 'preferences' });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-background');

  settings().then((theSettings) => {
    possibleClasses = flattenSettingOptions(theSettings[0].settings.options).map((option) => option.value);
    persistBackground();
  }).catch(() => {
    persistBackground();
    /* Failed to load settings for custom-background */
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-background',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
