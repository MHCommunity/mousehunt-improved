import {
  addSettingPreview,
  addStyles,
  flattenSettingOptions,
  getSetting,
  onNavigation,
  setMultipleTimeout
} from '@utils';

import settings from './settings';
import styles from './styles.css';

let addedClass = '';
let preferenceInput = null;
let showHornLink = null;
let isShowingHorn = false;
let hornTimeout = null;

const handlePreferenceChange = () => {
  addHornClass();
};

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
    addedClass = '';
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

  if (preferenceInput && preferenceInput !== input) {
    preferenceInput.removeEventListener('change', handlePreferenceChange);
  }

  if (preferenceInput === input) {
    return;
  }

  preferenceInput = input;
  preferenceInput.addEventListener('change', handlePreferenceChange);
};

/**
 * Add a preview link to show the horn.
 *
 * @param {MouseEvent} e The click event.
 */
const toggleHornPreview = (e) => {
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

  if (isShowingHorn) {
    isShowingHorn = false;
    showHornLink.textContent = 'Preview Horn';

    clearTimeout(hornTimeout);

    horn.classList.add('huntersHornView__horn--reveal');
    horn.classList.remove('huntersHornView__horn--ready');
    setTimeout(() => backdrop.classList.remove('huntersHornView__backdrop--active'), 400);
    hornTimeout = setTimeout(() => horn.classList.remove('huntersHornView__horn--reveal'), 1000);

    return;
  }

  isShowingHorn = true;
  showHornLink.textContent = 'Hide Horn';

  backdrop.classList.add('huntersHornView__backdrop--active');
  horn.classList.add('huntersHornView__horn--ready', 'huntersHornView__horn--reveal');

  clearTimeout(hornTimeout);
};

/**
 * Add a preview link to show the horn.
 */
const addShowHorn = () => {
  const previewLink = document.querySelector('.mh-improved-custom-horn-show-horn');
  if (! previewLink) {
    return;
  }

  if (showHornLink && showHornLink !== previewLink) {
    showHornLink.removeEventListener('click', toggleHornPreview);
  }

  if (showHornLink === previewLink) {
    return;
  }

  showHornLink = previewLink;
  isShowingHorn = false;
  clearTimeout(hornTimeout);
  showHornLink.textContent = 'Show Horn';
  showHornLink.addEventListener('click', toggleHornPreview);
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
        <img class="huntersHornView__hornGlintAnimatedGif" alt="" />
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

  // 'default' is kept so that the preview offers a way back to the stock horn.
  return flattenSettingOptions(settingsValues[0].settings.options, []).map((option) => ({
    id: option.value,
    name: option.name,
  }));
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-horn');

  persistHornClass();

  onNavigation(() => {
    setMultipleTimeout(() => {
      listenForPreferenceChanges();
      addShowHorn();
    }, [250, 500, 1000, 2000, 5000]);

    getHornSettingsValues().then((horns) => {
      addSettingPreview({
        id: 'custom-horn',
        selector: '.mh-improved-custom-horn-preview',
        inputSelector: '#mousehunt-improved-settings-design-custom-horn select',
        preview: false,
        items: horns,
        itemPreviewCallback: hornPreview,
      });
    }).catch(() => {
      /* Failed to load horn settings values */
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
