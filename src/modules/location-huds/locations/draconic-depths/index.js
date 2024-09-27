import { addHudStyles } from '@utils';
import keepInventoryToggled from '../../shared/folklore-forest/keep-inventory-open';

import regionStyles from '../../shared/folklore-forest/styles.css';
import styles from './styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([
    regionStyles,
    styles
  ]);

  keepInventoryToggled({
    setting: 'location-huds.prologue-pond-inventory-toggled',
    buttonSelector: '.headsUpDisplayDraconicDepths__inventoryContainerButton',
    inventorySelector: '.headsUpDisplayDraconicDepths__inventoryContainerBlockContent',
    inventoryOpenClass: 'headsUpDisplayDraconicDepths__inventoryContainerBlockContent--open',
    buttonOpenClass: 'headsUpDisplayDraconicDepths__inventoryContainerButton--open',
  });
};
