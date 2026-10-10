import { getFuromaRiftState } from '@utils/shared/stages/rift-furoma';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests.QuestRiftFuroma) {
    return '';
  }

  const state = getFuromaRiftState({ quests });

  if (state.inPagoda) {
    return `Pagoda · Battery ${state.battery} (${state.batteryPercent}%)<div class="stats">${state.droidEnerchi} Enerchi</div>`;
  }

  return `Outside · Battery ${state.highestUnlockedBattery}<div class="stats">${state.enerchi} Enerchi</div>`;
};
