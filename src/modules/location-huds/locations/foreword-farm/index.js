import { addHudStyles, makeElement, onDialogShow, waitForElement } from '@utils';
import folkloreForest from '../../shared/folklore-forest';
import keepInventoryToggled from '../../shared/folklore-forest/keep-inventory-open';

import regionStyles from '../../shared/folklore-forest/styles.css';
import styles from './styles.css';

const addMultiplePlantButtons = async () => {
  await waitForElement('.forewordFarmPlantDialogView-plant .folkloreForestRegionView-button.big');

  if (! (user?.quests?.QuestForewordFarm?.plots && user?.quests?.QuestForewordFarm?.plots.length >= 3)) {
    return; // only add x3 button if we have 3 plots.
  }

  const plantButtons = document.querySelectorAll('.forewordFarmPlantDialogView-plant .folkloreForestRegionView-button.big');

  plantButtons.forEach((button) => {
    if (button.parentNode.querySelector('.forewordFarmPlantDialogView-plantMultipleButton')) {
      return; // Skip if the button already exists
    }

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
        }
      }

      let shouldDisableButton = false;
      // if we can't plant anything in any of the plots, disable the button.
      const allPlotsFull = user?.quests?.QuestForewordFarm?.plots.every((plot) => ! plot.can_plant_anything && plot.is_queue_full);
      if (allPlotsFull) {
        shouldDisableButton = true;
      }

      if (button.classList.contains('disabled')) {
        shouldDisableButton = true;
      }

      if (shouldDisableButton) {
        newButton.classList.add('disabled');
      } else {
        newButton.classList.remove('disabled');
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
