import { loadFeatures } from '@utils';

import featureManifest from './feature-manifest';
import settings from './settings';
import { startTrapSelectorRuntime } from './trap-selector-runtime';

/**
 * Initialize the module.
 */
const init = async () => {
  await loadFeatures(featureManifest);

  startTrapSelectorRuntime();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-trap-selector',
  name: 'Better Trap Selector',
  type: 'hunting-traps',
  default: true,
  description: 'Add filters, skin and codex options, and correct base stats to the trap selector.',
  load: init,
  settings,
};
