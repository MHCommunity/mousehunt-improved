import { getSetting, loadFeatures, onSettingsChange, saveSetting } from '@utils';

import featureManifest from './feature-manifest';
import settings from './settings';

/**
 * Initialize the module.
 */
const init = () => {
  loadFeatures(featureManifest);

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
