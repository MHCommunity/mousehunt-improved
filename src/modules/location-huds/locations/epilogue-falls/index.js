import { addHudStyles, makeElement, onRequest, onTurn } from '@utils';

import folkloreForest from '../../shared/folklore-forest';

import regionStyles from '../../shared/folklore-forest/styles.css';
import styles from './styles.css';

const highlightBarrelHealth = async () => {
  const healthContainer = document.querySelector('.headsUpDisplayEpilogueFallsView__barrelHealthContainer');
  if (! healthContainer) {
    return;
  }

  healthContainer.classList.remove('mh-improved-high-health');
  healthContainer.classList.remove('mh-improved-low-health');
  healthContainer.classList.remove('mh-improved-very-low-health');

  const health = user?.quests?.QuestEpilogueFalls?.rapids?.barrel?.health || 80;
  const healthPercent = user?.quests?.QuestEpilogueFalls?.rapids?.barrel?.health_percentage || 100;
  if (healthPercent >= 80) {
    healthContainer.classList.add('mh-improved-high-health');
  } else if (healthPercent <= 10) {
    healthContainer.classList.add('mh-improved-low-health');
  }

  if (health <= 5) {
    healthContainer.classList.add('mh-improved-very-low-health');
  }

  if (health <= 1) {
    healthContainer.classList.add('mh-improved-last-hunt');
  }
};

const updateBarrelCraftDialog = async () => {
  const craftButton = document.querySelector('.headsUpDisplayEpilogueFallsView__craftBarrelButton');
  if (! craftButton) {
    return;
  }

  craftButton.addEventListener('click', () => {
    user.quests.QuestEpilogueFalls?.barrels.forEach((barrel) => {
      if (! barrel.can_craft && barrel?.cost?.length) {
        barrel.cost.forEach((ingredient) => {
          const ownedQty = user.quests.QuestEpilogueFalls?.items[ingredient.type]?.quantity_unformatted;
          if (ingredient.quantity > ownedQty) {
            const itemEl = document.querySelector(`.epilogueFallsBarrelChoiceDialogView__barrel[data-barrel-type='${barrel.type}'] .epilogueFallsBarrelChoiceDialogView__costItemThumbnail[style*='${ingredient.thumb_transparent}']`);
            if (itemEl) {
              itemEl.classList.add('mh-improved-missing-ingredient');
            }
          }
        });
      }
    });
  });
};

const updateBoostButton = (response) => {
  const boostButton = document.querySelector('.headsUpDisplayEpilogueFallsView__jetBoostButton');
  if (! boostButton) {
    return;
  }

  const existingText = boostButton.querySelector('.mh-improved-boost-cost-text');
  if (existingText) {
    existingText.remove();
  }

  const userData = response?.user || window.user;

  const boostCost = userData?.quests?.QuestEpilogueFalls?.jet_boost?.current_boost_cost?.poetic_plank_stat_item || 0;
  if (! boostCost || boostCost <= 0) {
    return;
  }

  const boostWrapper = makeElement('div', 'mh-improved-boost-cost-wrapper');
  makeElement('span', 'mh-improved-boost-cost-text', boostCost.toLocaleString(), boostWrapper);
  makeElement('span', 'mh-improved-boost-cost-label', 'Planks', boostWrapper);
  boostButton.append(boostWrapper);
};

const run = () => {
  highlightBarrelHealth();
  updateBarrelCraftDialog();
  updateBoostButton();
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([regionStyles, styles]);

  folkloreForest();

  run();
  onTurn(run, 250);
  onRequest('environment/epilogue_falls.php', (resp) => {
    setTimeout(updateBoostButton, 150, resp);
  }, true);
};
