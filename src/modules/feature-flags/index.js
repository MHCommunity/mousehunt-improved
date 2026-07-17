import { getFlag, getSetting, onSettingsChange, saveSetting } from '@utils';

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

  if (!getFlag('userscript-styles-no-rankup-forecaster')) {
    rankupForecaster();
  }

  if (getFlag('fake-fabled')) {
    showFabledProgressBarText();
  }

  onSettingsChange('override-flags', () => {
    const overrideFlags = getSetting('override-flags', '');
    const newOverrideFlags = overrideFlags.toLowerCase().replaceAll(' ', '');
    if (newOverrideFlags !== overrideFlags) {
      saveSetting('override-flags', newOverrideFlags);
    }

    const flagInput = document.querySelector('#setting-override-flags');
    if (flagInput) {
      flagInput.value = newOverrideFlags;
    }
  });
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
