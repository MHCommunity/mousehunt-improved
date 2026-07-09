import {
  addSettingPreview,
  flattenSettingOptions,
  getSetting,
  onEvent,
  onNavigation
} from '@utils';

import settings from './settings';

import gradients from '@data/backgrounds.json';

import blueprint from './styles/blueprint.css';
import groovyGreen from './styles/groovy-green.css';
import midnight from './styles/midnight.css';
import suede from './styles/suede.css';

/**
 * Add the custom HUD style element.
 *
 * @param {string} selectedPreview The selected preview.
 */
const addStyleEl = (selectedPreview = false) => {
  const setting = selectedPreview || getSetting('custom-hud-0', 'default');

  const stylesEl = document.querySelector('#mh-improved-custom-hud-style');
  if (stylesEl) {
    stylesEl.remove();
  }

  if ('default' === setting) {
    return;
  }

  const mapping = {
    'hud-blueprint': blueprint,
    'hud-suede': suede,
    'hud-groovy-green': groovyGreen,
    'hud-midnight': midnight,
  };

  const styleEl = document.createElement('style');
  styleEl.id = 'mh-improved-custom-hud-style';

  if (mapping[setting]) {
    styleEl.textContent = mapping[setting];
  } else {
    const gradient = gradients.find((g) => g.id === setting);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (gradient) {
      styleEl.textContent = `body .mousehuntHud-marbleDrawer {
        background: url(https://i.mouse.rip/mousehuntHudPedestal.png) -46px 0 no-repeat, url(https://i.mouse.rip/mousehuntHudPedestal.png) 731px 0 no-repeat, ${gradient.css};
      }`;
    } else {
      styleEl.textContent = `body .mousehuntHud-marbleDrawer {
        background: url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif) -46px 0 no-repeat, url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif) 731px 0 no-repeat, url(https://i.mouse.rip/mh-improved/marble-shadow.png) 6px 0 no-repeat, url(https://i.mouse.rip/mh-improved/custom-hud/${setting}.png) repeat-y top center;
      }

      .mousehuntHud-titleProgressBar {
        mix-blend-mode: luminosity;
      }`;
    }
  }

  document.head.append(styleEl);
};

/**
 * Get every HUD background choice as a preview item.
 *
 * @return {Promise<Array>} The preview items.
 */
const getPreviewItems = async () => {
  const theSettings = await settings();

  return flattenSettingOptions(theSettings[0].settings.options).map((option) => {
    const gradient = gradients.find((g) => g.id === option.value);

    return {
      id: option.value,
      name: option.name,
      css: gradient ? gradient.css : `url(https://i.mouse.rip/mh-improved/custom-hud/${option.value}.png) repeat top center`,
    };
  });
};

/**
 * Persist the styles on navigation.
 */
const persistBackground = () => {
  addStyleEl();

  onEvent('mh-improved-settings-changed', ({ key }) => {
    if ('custom-hud-0' === key) {
      addStyleEl();
    }
  });

  onNavigation(() => {
    getPreviewItems().then((items) => {
      addSettingPreview({
        id: 'custom-hud',
        selector: '.mh-improved-custom-hud-preview',
        inputSelector: '#mousehunt-improved-settings-design-custom-hud select',
        items,
        previewCallback: (selected) => addStyleEl(selected),
      });
    }).catch(() => {
      /* Failed to load HUD settings values */
    });
  }, {
    page: 'preferences',
    onLoad: true,
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  persistBackground();
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-hud',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
