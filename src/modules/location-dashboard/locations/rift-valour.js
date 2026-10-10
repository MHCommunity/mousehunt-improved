import { getValourRiftState } from '@utils/shared/stages/rift-valour';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests.QuestRiftValour) {
    return '';
  }

  const state = getValourRiftState({ quests });
  const text = state.isOutside ? 'Outside' : `Floor ${state.floor} (${state.floorName}) · ${state.huntsRemaining} hunts remaining`;

  return `<div>${state.isUmbra ? 'Ultimate Umbra' : ''}</div> ${text} <div class="stats">Speed ${state.speed} · Sync ${state.sync} · Siphon ${state.siphon}</div>`;
};
