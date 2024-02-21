import { addStyles, getFlag, onNavigation } from '@utils';

import friends from './friends';
import hud from './hud';

import profilePlusFixStyles from './profile-plus-fixes.css';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const addProfilePlusFixes = () => {
  const hasProfilePlus = document.querySelector('#copyCrownsButton');
  if (! hasProfilePlus) {
    return;
  }

  addStyles(profilePlusFixStyles, 'better-ui-profile-plus-fixes');
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-ui');

  friends();
  hud();

  if (! getFlag('no-better-ui-profile-plus', false)) {
    onNavigation(() => {
      setTimeout(addProfilePlusFixes, 1000);
    }, {
      page: 'hunterprofile',
    });
  }
};

export default {
  id: 'better-ui',
  name: 'Better UI',
  type: 'better',
  default: true,
  description: 'Updates the MH interface with a variety of UI and style changes.',
  load: init,
};
