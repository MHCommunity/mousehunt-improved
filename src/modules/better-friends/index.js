import { loadFeatures } from '@utils';

import featureManifest from './feature-manifest';
import settings from './settings';

/**
 * Initialize the module.
 */
const init = async () => {
  await loadFeatures(featureManifest);
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-friends',
  name: 'Better Friends',
  type: 'friends-gifts',
  default: true,
  description: 'Add mini profiles on hover, corkboard emotes, scoreboard search on profiles, and more.',
  load: init,
  settings,
};
