import { addHudStyles } from '@utils';

import addCraftingButtons from '../../shared/crafting-buttons';
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

  addCraftingButtons({
    baits: {
      fiery_fontina_cheese: {
        amounts: ['25-normal', 50],
        shopNormal: 'fiery_fontina_cheese',
        shop: 'fiery_fontina_pack_small_convertible',
      },
      icy_isabirra_cheese: {
        amounts: ['25-normal', 50],
        shopNormal: 'icy_isabirra_cheese',
        shop: 'icy_isabirra_pack_small_convertible',
      },
      poisonous_provolone_cheese: {
        amounts: ['25-normal', 50],
        shopNormal: 'poisonous_provolone_cheese',
        shop: 'poisonous_provolone_pack_small_convertible',
      },
      elemental_emmental_cheese: {
        amounts: [10, 50],
        shopNormal: 'elemental_emmental_cheese',
        shop: 'elemental_emmental_pack_small_convertible',
      }
    },
    selectors: {
      baits: '.headsUpDisplayDraconicDepthsView__baitCraftableContainer',
      baitQuantity: '.headsUpDisplayDraconicDepthsView__baitQuantity',
      baitBuyButton: '.headsUpDisplayDraconicDepthsView__baitBuyButton',
      baitCraftQty: '.headsUpDisplayDraconicDepthsView__ingredientQuantity',
    },
  });
};
