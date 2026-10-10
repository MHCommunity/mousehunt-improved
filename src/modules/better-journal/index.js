import { addStyles, loadFeatures } from '@utils';

import journalBehaviors from './behaviors';
import featureManifest from './feature-manifest';
import loadStyleBundles from './style-bundles';

import styles from './styles/styles.css';

import settings from './settings';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-journal');
  journalBehaviors();
  loadStyleBundles();

  await loadFeatures(featureManifest);
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-journal',
  name: 'Better Journal',
  type: 'journal',
  default: true,
  description: "Improve the journal's text, layout, and styling.",
  load: init,
  settings,
};
