import { getFlag, getSetting } from '@utils';

import raffle from './modules/raffle';
import rankupForecaster from './modules/rank-up-forecaster';
import socialNoop from './modules/social';
import trollMode from './modules/troll-mode';

import settings from './settings';

/**
 * Initialize the module.
 */
const init = async () => {
  if (getSetting('experiments.raffle')) {
    raffle();
  }

  if (getSetting('experiments.lol-gottem')) {
    trollMode();
  }

  if (getFlag('social-noop') || getFlag('twitter')) {
    socialNoop();
  }

  if (! getFlag('rankup-forecaster')) {
    rankupForecaster();
  }
};

export default {
  id: 'feature-flags',
  type: 'advanced',
  alwaysLoad: true,
  load: init,
  settings,
  order: 200,
};
