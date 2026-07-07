import {
  addHudStyles,
  formatNumber,
  makeElement,
  onTurn,
  parseNumber,
  replaceOrAppend
} from '@utils';

import styles from './styles.css';

/**
 * Get the droid and enerchi stats.
 *
 * @return {Object} The stats.
 */
const getEnergyStats = () => {
  const droid = parseNumber(user?.quests?.QuestRiftFuroma?.droid?.remaining_energy || 0);
  const lost = parseNumber(user?.quests?.QuestRiftFuroma?.droid?.energy_lost || 0);
  const recall = Math.floor((droid - lost) / 2);
  const energy = parseNumber(user?.quests?.QuestRiftFuroma?.items?.combat_energy_stat_item?.quantity || 0);

  return {
    droid,
    lost,
    recall,
    energy,
    afterRecall: energy + recall,
  };
};

/**
 * Add the recall stats to the HUD.
 */
const addRecallCaclulation = () => {
  const { recall, afterRecall } = getEnergyStats();

  const statBlocks = document.querySelector('.riftFuromaHUD-droid-details .riftFuromaHUD-chargeLevel-stat.droid_energy');
  if (statBlocks) {
    const existingRecall = document.querySelector('.mh-improved-recall');
    const afterRecallEl = makeElement('div', 'mh-improved-recall');

    if ('---' === user?.quests?.QuestRiftFuroma?.droid?.remaining_energy) {
      if (existingRecall) {
        existingRecall.remove();
      }

      if (afterRecallEl) {
        afterRecallEl.remove();
      }

      return;
    }

    makeElement('div', 'riftFuromaHUD-chargeLevel-stat-label', 'After Recall', afterRecallEl);
    makeElement('div', 'riftFuromaHUD-chargeLevel-stat-value', formatNumber(afterRecall), afterRecallEl);

    if (existingRecall) {
      existingRecall.replaceWith(afterRecallEl);
    } else {
      statBlocks.append(afterRecallEl);
    }
  }

  const leave = document.querySelector('.riftFuromaHUD-leavePagoda');
  if (leave) {
    const amountEl = makeElement('div', 'mh-improved-riftFuromaHUD-leavePagoda-amount', `+ ${formatNumber(recall)}`);

    replaceOrAppend(leave, '.mh-improved-riftFuromaHUD-leavePagoda-amount', amountEl);
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addRecallCaclulation();
  onTurn(addRecallCaclulation);
};
