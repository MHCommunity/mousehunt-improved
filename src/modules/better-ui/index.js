import { addStyles, getSetting } from '@utils';

import adventurebook from './modules/adventure-book';
import friends from './modules/friends';
import hud from './modules/hud';
import kingsPromo from './modules/kings-promo';
import legacyStyles from './modules/legacy-styles';
import maintenance from './modules/maintenance';
import profile from './modules/profile';
import userscriptStyles from './modules/userscripts-styles';

import settings from './settings';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'better-ui');

  adventurebook();
  friends();
  kingsPromo();
  maintenance();
  userscriptStyles();

  if (getSetting('better-ui.hud-changes', true)) {
    hud();
  }

  if (getSetting('better-ui.profile-changes', true)) {
    profile();
  }

  legacyStyles();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-ui',
  name: 'Better UI',
  type: 'better',
  default: true,
  description: 'Update the MH interface with various UI and style changes.',
  order: -1,
  load: init,
  settings,
};
