import { getFlag } from '@utils';

import rankupForecaster from './modules/rank-up-forecaster';
import socialNoop from './modules/social';

import settings from './settings';

/**
 * Initialize the module.
 */
const init = async () => {
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
