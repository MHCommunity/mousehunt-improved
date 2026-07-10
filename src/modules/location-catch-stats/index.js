import { addStyles, addSubmenuItem, getSetting } from '@utils';

import { showSimplifiedModal } from './stats';
import { showSummaryModal } from './summary';

import crownColoredRowsStyles from './crown-colored-rows.css';
import styles from './styles.css';
import summaryStyles from './summary.css';

import settings from './settings';

/**
 * Show the configured catch stats view.
 */
const showModal = () => {
  if (getSetting('location-catch-stats.simplified-view', false)) {
    return showSimplifiedModal();
  }

  return showSummaryModal();
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([
    styles,
    summaryStyles,
    getSetting('location-catch-stats.crown-colored-rows', false) ? crownColoredRowsStyles : null
  ]
  , 'location-catch-stats');

  addSubmenuItem({
    menu: 'mice',
    label: 'Location Catch Stats',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/prize_shoppe.png?',
    callback: showModal,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'location-catch-stats',
  name: 'Location Catch Stats',
  type: 'locations-maps-travel',
  default: true,
  description: 'Add a “Location Catch Stats” option to the Mice menu to see your catch stats for the current location and every other location.',
  load: init,
  settings,
};
