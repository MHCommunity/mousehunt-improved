import { addStyles, loadFeatures } from '@utils';

import featureManifest from './feature-manifest';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'fixes');

  loadFeatures(featureManifest);
};

/**
 * Initialize the module.
 */
export default {
  id: 'fixes',
  name: 'Fixes',
  description: 'Fix small bugs and display glitches in the game.',
  type: 'advanced',
  default: true,
  load: init,
};
