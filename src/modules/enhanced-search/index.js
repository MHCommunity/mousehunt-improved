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
  type: 'inventory-shops',
  alwaysLoad: true,
  load: init,
};
