import { getSetting, onNavigation } from '@utils';

import settings from './settings';

import gradients from '@data/backgrounds.json';

const addStyleEl = () => {
  const setting = getSetting('custom-hud-0', 'default');

  const stylesEl = document.querySelector('#mh-improved-custom-hud-style');
  if (stylesEl) {
    stylesEl.remove();
  }

  if ('default' === setting) {
    return;
  }

  const styleEl = document.createElement('style');
  styleEl.id = 'mh-improved-custom-hud-style';

  // eslint-disable-next-line unicorn/prefer-ternary
  const gradient = gradients.find((g) => g.id === setting);
  // eslint-disable-next-line unicorn/prefer-ternary
  if (gradient) {
    styleEl.innerHTML = `body .mousehuntHud-marbleDrawer {
      background: url(https://i.mouse.rip/mousehuntHudPedestal.png) -46px 0 no-repeat, url(https://i.mouse.rip/mousehuntHudPedestal.png) 731px 0 no-repeat, ${gradient.css};
    }`;
  } else {
    styleEl.innerHTML = `body .mousehuntHud-marbleDrawer {
      background: url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif) -46px 0 no-repeat, url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif) 731px 0 no-repeat, url(https://i.mouse.rip/mh-improved/marble-shadow.png) 6px 0 no-repeat, url(https://i.mouse.rip/mh-improved/custom-hud/${setting}.png) repeat-y top center;
    }

    .mousehuntHud-titleProgressBar {
      mix-blend-mode: luminosity;
    }`;
  }

  document.head.append(styleEl);
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
  id: 'custom-hud',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
