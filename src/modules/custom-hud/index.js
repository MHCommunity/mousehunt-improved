import { getSetting, onNavigation } from '@utils';

import settings from './settings';

import blueprint from './styles/blueprint.css';
import groovyGreen from './styles/groovy-green.css';
import midnight from './styles/midnight.css';
import suede from './styles/suede.css';

const addStyleEl = () => {
  const setting = getSetting('custom-hud-0', 'default');

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

  // eslint-disable-next-line unicorn/prefer-ternary
  if (mapping[setting]) {
    styleEl.innerHTML = mapping[setting];
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
