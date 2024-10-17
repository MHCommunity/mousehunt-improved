import {
  addSettingPreview,
  addStyles,
  getSetting,
  onNavigation,
  setMultipleTimeout
} from '@utils';

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

  let setting = getSetting('custom-horn-0', 'default');
  if (preview) {
    setting = preview;
  }

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
const addShowHorn = () => {
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
      previewLink.textContent = 'Preview Horn';

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
};

const hornPreview = (horn) => {
  return `<div class="mh-improved-custom-horn-preview ${horn.id}">
  <a class="huntersHornView__horn huntersHornView__horn--default huntersHornView__horn--reveal huntersHornView__horn--ready">
    <div class="huntersHornView__hornImage">
      <div class="huntersHornView__hornForeground"></div>
      <div class="huntersHornView__hornGlint">
        <div class="huntersHornView__hornGlintImage"></div>
        <img class="huntersHornView__hornGlintAnimatedGif">
      </div>
    </div>
    <div class="huntersHornView__hornBanner">
      <div class="huntersHornView__hornBannerTranslate">
        <div class="huntersHornView__hornBannerImage"></div>
      </div>
    </div>
  </a>
</div>`;
};

const getHornSettingsValues = async () => {
  const settingsValues = await settings();
  const horns = settingsValues[0].settings.options.reduce((acc, option) => {
    if (option.options && Array.isArray(option.options)) {
      return [...acc, ...option.options];
    }

    if (option.value && option.name) {
      return [...acc, option];
    }

    return acc;
  }, []).map((option) => {
    return {
      id: option.value,
      name: option.name,
    };
  });

  return horns;
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'custom-horn');

  persistHornClass();

  onNavigation(async () => {
    setMultipleTimeout(() => {
      listenForPreferenceChanges();
      addShowHorn();
    }, [250, 500, 1000, 2000, 5000]);

    const horns = await getHornSettingsValues();
    addSettingPreview({
      id: 'custom-horn',
      selector: '.mh-improved-custom-horn-preview',
      inputSelector: '#mousehunt-improved-settings-design-custom-horn select',
      preview: false,
      items: horns,
      itemPreviewCallback: hornPreview,
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
  id: 'custom-horn',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
