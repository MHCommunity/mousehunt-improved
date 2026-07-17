import { addStyles, getSetting } from '@utils';

import featureManifest from './feature-manifest';
import settings from './settings';
import { startTrapSelectorRuntime } from './trap-selector-runtime';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = () => {
  if (getSetting('better-ui.styles', true)) {
    addStyles(styles, 'better-ui');
  }

  for (const feature of featureManifest) {
    if (feature.condition && !feature.condition()) {
      continue;
    }

    if (feature.setting && !getSetting(feature.setting, feature.default)) {
      continue;
    }

    feature.load();
  }

  startTrapSelectorRuntime();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-ui',
  name: 'Better UI',
  type: 'appearance',
  default: true,
  description: 'Update the interface with UI and style changes.',
  order: -1,
  load: init,
  settings,
};
