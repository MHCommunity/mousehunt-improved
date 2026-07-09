import { getFlag } from '@utils';

import rankupForecaster from './modules/rank-up-forecaster';
import showFabledProgressBarText from './modules/fake-fabled';
import socialNoop from './modules/social';

import settings from './settings';

/**
 * Initialize the module.
 */
const init = () => {
  if (getFlag('social-noop') || getFlag('twitter')) {
    socialNoop();
  }

  if (! getFlag('userscript-styles-no-rankup-forecaster')) {
    rankupForecaster();
  }

  if (getFlag('fake-fabled')) {
    showFabledProgressBarText();
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'feature-flags',
  type: 'advanced',
  alwaysLoad: true,
  load: init,
  settings,
  order: 200,
};
