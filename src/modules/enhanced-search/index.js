import { addStyles } from '@utils';

import { initItems } from './items';

import inventory from './modules/inventory';
import marketplace from './modules/marketplace';
import sendSupplies from './modules/send-supplies';
import trapSelector from './modules/trap-selector';

import styles from './styles.css';

const surfaces = [inventory, trapSelector, marketplace, sendSupplies];

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'enhanced-search');

  await initItems();

  await Promise.all(surfaces.map((load) => load()));
};

/**
 * Initialize the module.
 */
export default {
  id: 'enhanced-search',
  name: 'Item Abbreviation Search',
  description: 'Find items by their abbreviations, so searching "ESB" turns up Empowered SUPER|brie+.',
  type: 'inventory-shops',
  default: false,
  load: init,
};
