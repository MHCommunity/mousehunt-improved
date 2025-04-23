import {
  addHudStyles,
  makeElement,
  onRequest,
  onTurn,
  waitForElement
} from '@utils';

import addCraftingButtons from '../../shared/crafting-buttons';
import keepInventoryToggled from '../../shared/folklore-forest/keep-inventory-open';

import regionStyles from '../../shared/folklore-forest/styles.css';
import styles from './styles.css';

const addQuickReinforce = () => {
  setTimeout(addQuickReinforceReal, 300);
};

const addQuickReinforceReal = () => {
  const wrapper = document.querySelector('.draconicDepthsCavernView__reinforceCavernContainer');
  if (! wrapper) {
    return;
  }

  const reinforceButton = wrapper.querySelector('.draconicDepthsCavernView__reinforceCavernButton');
  if (! reinforceButton) {
    return;
  }

  if (reinforceButton.classList.contains('draconicDepthsCavernView__reinforceCavernButton--quick-reinforce')) {
    return;
  }

  const quest = user?.quests?.QuestDraconicDepths;
  if (! quest) {
    return;
  }

  const button = makeElement('button', ['mh-improved-quick-reinforce', 'draconicDepthsCavernView__reinforceCavernButton'], 'Max');

  const canReinforce = quest?.cavern?.reinforcement?.can_reinforce;
  if (canReinforce) {
    button.classList.remove('draconicDepthsCavernView__reinforceCavernButton--disabled');
    button.removeAttribute('disabled');
  } else {
    button.classList.add('draconicDepthsCavernView__reinforceCavernButton--disabled');
    button.setAttribute('disabled', 'disabled');
  }

  const remaining = quest?.cavern?.hunts_remaining;
  const max = quest?.cavern?.max_hunts_remaining;
  const costPerReinforce = quest?.cavern?.reinforcement?.cost[0]?.quantity;
  const totalCost = (max - remaining) * costPerReinforce;
  const embers = quest?.items?.dragon_ember?.quantity_unformatted;
  const canAffordReinforces = totalCost > embers ? Math.floor(embers / costPerReinforce) : max - remaining;
  if (canAffordReinforces <= 0) {
    button.classList.add('draconicDepthsCavernView__reinforceCavernButton--disabled');
    button.setAttribute('disabled', 'disabled');
  } else {
    button.classList.remove('draconicDepthsCavernView__reinforceCavernButton--disabled');
    button.removeAttribute('disabled');
  }

  button.innerText = canAffordReinforces > 0 ? `Max (+${canAffordReinforces})` : 'Max';

  button.addEventListener('click', async () => {
    if (button.classList.contains('draconicDepthsCavernView__reinforceCavernButton--disabled')) {
      return;
    }

    reinforceButton.click();

    const reinforceInput = await waitForElement('.draconicDepthsReinforceCavernDialogView__reinforceInputBox');
    if (! reinforceInput) {
      if (window.activejsdialog) {
        window.activejsdialog.hide();
      }
      return;
    }

    reinforceInput.value = Math.min(canAffordReinforces, 1);
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    reinforceInput.dispatchEvent(event);

    const reinforceDialogButton = document.querySelector('.draconicDepthsReinforceCavernDialogView__reinforceButton');
    if (! reinforceDialogButton) {
      if (window.activejsdialog) {
        window.activejsdialog.hide();
      }
      return;
    }
    setTimeout(() => {
      reinforceDialogButton.click();
    }, 300);

    button.innerText = `Max (+${canAffordReinforces})`;
  });

  reinforceButton.classList.add('draconicDepthsCavernView__reinforceCavernButton--quick-reinforce');
  wrapper.append(button);
};

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
        amounts: [10, 24, 50],
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

  addQuickReinforce();
  onTurn(addQuickReinforce);
  onRequest('environment/draconic_depths.php', addQuickReinforce);
};
