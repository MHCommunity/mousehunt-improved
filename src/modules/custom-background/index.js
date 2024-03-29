import { addStyles, createPopup, getSetting, onNavigation } from '@utils';

import gradients from './gradients.json';

import settings from './settings';
import styles from './styles.css';

let addedClass = '';
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
  const previewLink = document.querySelector('.mh-improved-custom-bg-preview');
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
        <div class="controls">
          <div class="mousehuntActionButton lightBlue mh-improved-custom-bg-action-button" data-gradient="${gradient.id}" data-action="preview"><span>Preview</span></div>
          <div class="mousehuntActionButton mh-improved-custom-bg-action-button" data-gradient="${gradient.id}" data-action="use"><span>Use</span></div>
          </div>
      </div>`;
    });

    const popup = createPopup({
      title: '',
      className: 'mh-improved-custom-background-gradient-preview-popup',
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
          addBodyClass(gradient);
        } else if ('use' === actionType) {
          const input = document.querySelector('#mousehunt-improved-settings-design-custom-background select');
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

export default {
  id: 'custom-background',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
