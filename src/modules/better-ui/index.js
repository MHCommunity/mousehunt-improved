import { addStyles, getSetting, loadFeatures } from '@utils';

import featureManifest from './feature-manifest';
import settings from './settings';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = () => {
  if (getSetting('better-ui.styles', true)) {
    addStyles(styles, 'better-ui');
  }

  loadFeatures(featureManifest);
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-ui',
  name: 'Better UI',
  description: "Improve the game's styling and fix small interface annoyances.",
  type: 'interface',
  default: true,
  order: -1,
  load: init,
  settings,
};
