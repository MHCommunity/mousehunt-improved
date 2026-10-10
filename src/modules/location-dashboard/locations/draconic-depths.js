import { getDraconicDepthsState } from '@utils/shared/stages/draconic-depths';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests?.QuestDraconicDepths) {
    return '';
  }

  const state = getDraconicDepthsState({ quests });

  if (state.inCavern) {
    const crucibleIcons = state.crucibles.map(({ type }) => `<div class="dashboard-crucible-type dashboard-crucible-${type}"></div>`).join('');

    return `
      <div class="dashboard-cavern-header">
        <div class="dashboard-crucible-icons">${crucibleIcons}</div>
        <div class="dashboard-cavern-name">${state.cavernName || 'Unknown Cavern'}</div>
      </div>
      <div class="stats">${state.huntsRemaining} hunts remaining · Tier ${state.tier} [${state.range}]</div>
    `.trim();
  }

  const completed = state.crucibles.filter((crucible) => crucible.is_max_progress).length;

  const crucibleStatus = state.crucibles
    .map((crucible) => {
      return `<div class="dashboard-crucible">
      <div class="dashboard-crucible-type dashboard-crucible-${crucible.type}"></div>
      <div class="dashboard-crucible-progress">${crucible.is_max_progress ? 'Ready' : `${crucible.progress || 0}/${crucible.max_progress || 25}`}</div>
    </div>`;
    })
    .join('');

  return `Crucible Forge · ${completed}/${state.crucibles.length} crucibles ready
    <div class="stats">${crucibleStatus}</div>
  `.trim();
};
