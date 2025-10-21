import { addStyles, getSetting } from '@utils';

import adventurebook from './modules/adventure-book';
import codexAtBottom from './modules/codex-at-bottom';
import friends from './modules/friends';
import hud from './modules/hud';
import kingsPromo from './modules/kings-promo';
import largerCodices from './modules/larger-codices';
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

  const modules = [
    { enabled: getSetting('better-ui.hud-changes', true), load: hud },
    { enabled: getSetting('better-ui.profile-changes', true), load: profile },
    { enabled: getSetting('better-ui.larger-codices', true), load: largerCodices },
    { enabled: getSetting('better-ui.larger-skin-images', true), load: largerSkinImages },
    { enabled: getSetting('better-ui.show-unowned-skins', true), load: showUnownedSkins },
    { enabled: getSetting('better-ui.codex-at-bottom', true), load: codexAtBottom },
  ];

  for (const module of modules) {
    if (module.enabled) {
      module.load();
    }
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
