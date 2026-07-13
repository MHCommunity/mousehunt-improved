import { addStyles, getSetting } from '@utils';

import { initItems } from './items';

import inventory from './modules/inventory';
import marketplace from './modules/marketplace';
import sendSupplies from './modules/send-supplies';
import trapSelector from './modules/trap-selector';

import styles from './styles.css';

const surfaces = [
  { id: 'inventory', load: inventory },
  { id: 'trap-selector', load: trapSelector },
  { id: 'marketplace', load: marketplace },
  { id: 'send-supplies', load: sendSupplies },
];

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'enhanced-search');

  await initItems();

  await Promise.all(
    surfaces
      .filter(({ id }) => getSetting(`enhanced-search.${id}`, true))
      .map(({ load }) => load())
  );
};

/**
 * Initialize the module.
 */
export default {
  id: 'enhanced-search',
  name: 'Enhanced Search',
  description: 'Find items by their abbreviations, so searching "ESB" turns up Empowered SUPER|brie+.',
  load: init
};
