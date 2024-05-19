import { addStyles, createPopup, getSetting, onNavigation } from '@utils';

import gradients from '@data/backgrounds.json';

import settings from './settings';
import styles from './styles.css';

let addedClass = '';

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

  // remove the old class
  if (addedClass) {
    // remove all the old classes
    if (Array.isArray(addedClass)) {
      addedClass.forEach((cls) => {
        body.classList.remove(cls);
      });
    } else {
      body.classList.remove(addedClass);
    }

    addedClass = '';
  }

  // remove the old injected style
  const style = document.querySelector('#mh-improved-custom-background-style');
  if (style) {
    style.remove();
  }

  if ('default' === setting) {
    return;
  }

  const background = `mh-improved-bg-${setting}`;

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

/**
 * Add a preview link to show the background options.
 */
const addPreview = () => {
  addPreviewCallback({
    id: 'custom-background',
    selector: '.mh-improved-custom-bg-preview',
    inputSelector: '#mousehunt-improved-settings-design-custom-background select',
    previewCallback: (selected) => addBodyClass(selected),
  });

  addPreviewCallback({
    id: 'custom-hud',
    selector: '.mh-improved-custom-hud-preview',
    inputSelector: '#mousehunt-improved-settings-design-custom-hud select',
    preview: false
  });
};

/**
 * Add a preview link to show the background options.
 *
 * @param {Object}   options                 The options for the preview.
 * @param {string}   options.id              The ID of the preview.
 * @param {string}   options.selector        The selector for the preview link.
 * @param {string}   options.inputSelector   The selector for the input.
 * @param {boolean}  options.preview         Whether or not to show the preview button.
 * @param {Function} options.previewCallback The callback function to run when previewing.
 */
const addPreviewCallback = ({ id, selector, inputSelector, preview = true, previewCallback = () => {} }) => {
  const previewLink = document.querySelector(selector);
  if (! previewLink) {
    return;
  }

  previewLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    let content = '';
    gradients.forEach((gradient) => {
      content += `<div class="gradient" style="background: ${gradient.css}">
        <div class="name">${gradient.name}</div>
        <div class="controls">`;
      if (preview) {
        content += `<div class="mousehuntActionButton lightBlue mh-improved-custom-bg-action-button" data-gradient="${gradient.id}" data-action="preview"><span>Preview</span></div>`;
      }

      content += `<div class="mousehuntActionButton mh-improved-custom-bg-action-button ${preview ? 'normal' : 'small'}" data-gradient="${gradient.id}" data-action="use"><span>Use</span></div>
          </div>
      </div>`;
    });

    const popup = createPopup({
      title: '',
      className: `mh-improved-custom-background-gradient-preview-popup mh-improved-custom-preview-popup-${id}`,
      content: `<div class="mh-improved-custom-background-gradient-preview">${content}</div>`,
      show: false,
    });

    popup.show();

    const previewActions = document.querySelectorAll('.mh-improved-custom-bg-action-button');
    previewActions.forEach((action) => {
      const gradient = action.getAttribute('data-gradient');
      const actionType = action.getAttribute('data-action');

      action.addEventListener('click', (evt) => {
        evt.preventDefault();

        if ('preview' === actionType) {
          previewCallback(gradient);
        } else if ('use' === actionType) {
          const input = document.querySelector(inputSelector);
          if (input) {
            input.value = gradient;
            input.dispatchEvent(new Event('change'));
          }

          popup.hide();
        }
      });
    });
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
  addStyles(styles, 'custom-background');

  persistBackground();
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
