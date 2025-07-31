import { addHudStyles, makeElement, onDialogShow, waitForElement } from '@utils';
import folkloreForest from '../../shared/folklore-forest';
import keepInventoryToggled from '../../shared/folklore-forest/keep-inventory-open';

import regionStyles from '../../shared/folklore-forest/styles.css';
import styles from './styles.css';

const addMultiplePlantButtons = async () => {
  await waitForElement('.forewordFarmPlantDialogView-plant .folkloreForestRegionView-button.big');
  const plantButtons = document.querySelectorAll('.forewordFarmPlantDialogView-plant .folkloreForestRegionView-button.big');
  plantButtons.forEach((button) => {
    const newButton = makeElement('a', 'forewordFarmPlantDialogView-plantMultipleButton', 'x3');
    if (button.classList.contains('disabled') || button.classList.contains('busy')) {
      newButton.classList.add('disabled');
    } else {
      newButton.classList.remove('disabled');
    }
    newButton.addEventListener('click', async (event) => {
      if (button.classList.contains('disabled') || button.classList.contains('busy')) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();

      for (let i = 0; i < 3; i++) {
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (button.classList.contains('disabled') || button.classList.contains('busy')) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
      }
    });
    button.parentNode.insertBefore(newButton, button.nextSibling);
  });
};

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

  onDialogShow('fabledForestDialog.forewordFarmPlantDialogPopup', addMultiplePlantButtons);
};
