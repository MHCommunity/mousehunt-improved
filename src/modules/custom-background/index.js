import {
  addSettingPreview,
  addStyles,
  getSetting,
  onNavigation,
  setMultipleTimeout
} from '@utils';

import gradients from '@data/backgrounds.json';

import settings from './settings';
import styles from './styles.css';

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

  if ('default' === setting) {
    return;
  }

  // remove all classes that are in the options
  possibleClasses.forEach((className) => {
    body.classList.remove(className);
  });

  const background = `mh-improved-bg-${setting}`;

  body.classList.remove('kings_giveaway');

  body.classList.add(background, setting);
  addedClass = [background, setting];

  if (setting.startsWith('background-color-')) {
    body.classList.remove(setting);
    body.classList.add(background);
    addedClass = background;
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
  gradientStyle.innerHTML = `.mh-improved-custom-background-gradient-preview,
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
 * Listen for changes to the preference.
 */
const listenForPreferenceChanges = () => {
  const input = document.querySelector('#mousehunt-improved-settings-design-custom-background select');
  if (! input) {
    return;
  }

  input.addEventListener('change', () => {
    addBodyClass();
  });
};

const addPreview = () => {
  addSettingPreview({
    id: 'custom-background',
    selector: '.mh-improved-custom-bg-preview',
    inputSelector: '#mousehunt-improved-settings-design-custom-background select',
    items: gradients,
    previewCallback: (selected) => addBodyClass(selected),
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

  addPreview();
  onNavigation(() => {
    setMultipleTimeout(listenForPreferenceChanges, [250, 500, 1000, 2000, 5000]);
    addPreview();
  }, { page: 'preferences' });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-background');

  const backgroundSetting = getSetting('custom-background-0', 'default');
  if ('default' === backgroundSetting) {
    return;
  }

  settings().then((theSettings) => {
    possibleClasses = theSettings[0].settings.options.reduce((acc, option) => {
      if ('group' === option.value) {
        return [...acc, ...option.options.map((subOption) => subOption.value)];
      }

      return [...acc, option.value];
    }, []);

    persistBackground();
  }).catch(() => {
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
