import { addStyles, getSetting } from '@utils';

import adventurebook from './modules/adventure-book';
import friends from './modules/friends';
import hud from './modules/hud';
import kingsPromo from './modules/kings-promo';
import largerSkinImages from './modules/larger-skin-images';
import legacyStyles from './modules/legacy-styles';
import maintenance from './modules/maintenance';
import profile from './modules/profile';
import randomSkinButton from './modules/random-skin-button';
import showUnownedSkins from './modules/show-unowned-skins';
import skinPreviewBase from './modules/skin-preview-base';
import userscriptStyles from './modules/userscripts-styles';

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

  adventurebook();
  friends();
  kingsPromo();
  maintenance();
  userscriptStyles();
  randomSkinButton();
  skinPreviewBase();

  if (getSetting('better-ui.hud-changes', true)) {
    hud();
  }

  if (getSetting('better-ui.profile-changes', true)) {
    profile();
  }

  if (getSetting('better-ui.larger-skin-images', true)) {
    largerSkinImages();
  }

  if (getSetting('better-ui.show-unowned-skins', true)) {
    showUnownedSkins();
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
  description: 'Update the interface with UI and style changes.',
  order: -1,
  load: init,
  settings,
};
