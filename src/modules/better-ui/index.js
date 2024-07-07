import { addStyles } from '@utils';

import adventurebook from './modules/adventure-book';
import dailyDraw from './modules/daily-draw';
import friends from './modules/friends';
import hud from './modules/hud';
import kingsPromo from './modules/kings-promo';
import legacyStyles from './modules/legacy-styles';
import maintenance from './modules/maintenance';
import userscriptStyles from './modules/userscripts-styles';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-ui');

  adventurebook();
  dailyDraw();
  friends();
  hud();
  kingsPromo();
  maintenance();
  userscriptStyles();
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
};
