import { addStyles, flattenSettingOptions, getSetting, onEvent, onNavigation } from '@utils';

import gradients from '@data/backgrounds.json';

import settings from './settings';
import styles from './styles.css';

let possibleClasses = [];
let addedClasses = [];

/**
 * Add a class to the body.
 */
const addBodyClass = () => {
  const body = document.querySelector('body');
  if (!body) {
    return;
  }

  const setting = getSetting('custom-background-0', 'default');

  // remove the old injected style
  const style = document.querySelector('#mh-improved-custom-background-style');
  if (style) {
    style.remove();
  }

  // Only remove the event classes we added, so the game's own event background still shows on Default.
  body.classList.remove('mh-improved-custom-background');
  possibleClasses.forEach((className) => {
    body.classList.remove(`mh-improved-bg-${className}`);
  });
  addedClasses.forEach((className) => body.classList.remove(className));
  addedClasses = [];

  if ('default' === setting) {
    return;
  }

  // A custom choice replaces any event background the game added.
  possibleClasses.forEach((className) => {
    if (className !== setting) {
      body.classList.remove(className);
    }
  });

  const background = `mh-improved-bg-${setting}`;
  body.classList.add(background);

  const gradient = gradients?.find((g) => g.id === setting);
  if (!gradient) {
    // Event backgrounds reuse the game's own `body.<event>` rules, so they need the bare class too.
    if (!setting.startsWith('background-color-') && !body.classList.contains(setting)) {
      body.classList.add(setting);
      addedClasses.push(setting);
    }

    return;
  }

  body.classList.add('mh-improved-custom-background');

  const gradientStyle = document.createElement('style');
  gradientStyle.id = 'mh-improved-custom-background-style';
  gradientStyle.textContent = `body.${background} .pageFrameView-column.right.right,
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
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-background');

  settings()
    .then((theSettings) => {
      possibleClasses = flattenSettingOptions(theSettings[0].settings.options).map((option) => option.value);
      persistBackground();
    })
    .catch(() => {
      persistBackground();
      /* Failed to load settings for custom-background */
    });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-background',
  type: 'appearance',
  alwaysLoad: true,
  load: init,
  settings,
};
