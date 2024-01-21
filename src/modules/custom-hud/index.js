import { getSetting, onNavigation } from '@utils';

import settings from './settings';

const addStyleEl = () => {
  const setting = getSetting('custom-hud-0', 'default');

  const stylesEl = document.querySelector('#mh-improved-custom-hud-style');
  if (stylesEl) {
    stylesEl.remove();
  }

  if ('default' !== setting) {
    const style = document.createElement('style');
    style.id = 'mh-improved-custom-hud-style';
    style.innerHTML = `body .mousehuntHud-marbleDrawer {
      background:
        url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif?asset_cache_version=2) -46px 0 no-repeat,
        url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif?asset_cache_version=2) 731px 0 no-repeat,
        url(https://i.mouse.rip/mh-improved/marble-shadow.png) 6px 0 no-repeat,
        url(https://i.mouse.rip/mh-improved/custom-hud/${setting}.png) repeat-y top center;
    }`;

    document.head.append(style);
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
  id: 'custom-hud',
  name: 'Custom HUD',
  type: 'design',
  default: false,
  description: '',
  load: init,
  alwaysLoad: true,
  settings,
};
