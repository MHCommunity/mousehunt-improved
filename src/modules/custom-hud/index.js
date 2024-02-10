import { getSetting, onNavigation } from '@utils';

import settings from './settings';

const addStyleEl = () => {
  const setting = getSetting('custom-hud-0', 'default');

  const stylesEl = document.querySelector('#mh-improved-custom-hud-style');
  if (stylesEl) {
    stylesEl.remove();
  }

  if ('default' === setting) {
    return;
  }

  let style;

  const pedastal = 'https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif?asset_cache_version=2';
  // eslint-disable-next-line unicorn/prefer-ternary
  if ('hud-blueprint' === setting) {
    style = `body .mousehuntHud-marbleDrawer {
      background:
        url(${pedastal}) -46px 0 no-repeat,
        url(${pedastal}) 731px 0 no-repeat,
        url(https://i.mouse.rip/mh-improved/custom-hud/${setting}.png) repeat-y top center;
    }`;
  } else {
    style = `body .mousehuntHud-marbleDrawer {
      background:
        url(${pedastal}) -46px 0 no-repeat,
        url(${pedastal}) 731px 0 no-repeat,
        url(https://i.mouse.rip/mh-improved/marble-shadow.png) 6px 0 no-repeat,
        url(https://i.mouse.rip/mh-improved/custom-hud/${setting}.png) repeat-y top center;
    }

    .mousehuntHud-titleProgressBar {
      mix-blend-mode: luminosity;
    }`;
  }

  if (style) {
    const styleEl = document.createElement('style');
    styleEl.id = 'mh-improved-custom-hud-style';
    styleEl.innerHTML = style;
    document.head.append(styleEl);
  }
};

const listenForPreferenceChanges = () => {
  const input = document.querySelector('#mousehunt-improved-settings-design-custom-hud select');
  if (! input) {
    return;
  }

  input.addEventListener('change', () => {
    addStyleEl();
  });
};

const persistBackground = () => {
  addStyleEl();
  onNavigation(listenForPreferenceChanges, {
    page: 'preferences',
    onLoad: true,
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  persistBackground();
};

export default {
  alwaysLoad: true,
  id: 'custom-hud',
  type: 'design',
  default: false,
  load: init,
  settings,
};
