import { addHudStyles } from '@utils';
import folkloreForest from '../shared/folklore-forest';
import keepInventoryToggled from '../shared/folklore-forest/keep-inventory-open';

import regionStyles from '../shared/folklore-forest/styles.css';
import styles from './styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([regionStyles, styles]);

  folkloreForest();

  keepInventoryToggled({
    setting: 'location-huds.foreward-farm-inventory-toggled',
    buttonSelector: '.folkloreForestRegionView-environmentInventory-expandButton',
    inventorySelector: '.folkloreForestRegionView-environmentInventoryContainer',
    inventoryOpenClass: 'expanded',
    buttonOpenClass: 'expanded',
  });
};
