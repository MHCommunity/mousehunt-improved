/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 * @return {string} The dashboard output.
 */
export default (quests) => {
  const quest = quests?.QuestDraconicDepths;
  if (! quest) {
    return '';
  }

  const inCavern = quest.in_cavern;
  const cavern = quest.cavern;
  const crucibleForge = quest.crucible_forge;

  if (inCavern && cavern) {
    const crucibleIcons = crucibleForge.crucibles.map(({ type }) => `<div class="dashboard-crucible-type dashboard-crucible-${type}"></div>`).join('');

    const depthMap = {
      1: '0-100',
      2: '100-250',
      3: '250-750',
      4: '750+'
    };

    return `
      <div class="dashboard-cavern-header">
        <div class="dashboard-crucible-icons">${crucibleIcons}</div>
        <div class="dashboard-cavern-name">${cavern.name || 'Unknown Cavern'}</div>
      </div>
      <div class="stats">
        ${cavern.hunts_remaining || 0} hunts remaining
        ${cavern.loot_tier && cavern.loot_tier.current_tier ? ` · Tier ${cavern.loot_tier.current_tier} [${depthMap[cavern.loot_tier.current_tier] || ''}]` : ''}
      </div>
    `.trim();
  }

  const crucibles = crucibleForge.crucibles;
  const completed = crucibles.filter((c) => c.is_max_progress).length;

  const crucibleStatus = crucibles.map((crucible) => {
    return `<div class="dashboard-crucible">
      <div class="dashboard-crucible-type dashboard-crucible-${crucible.type}"></div>
      <div class="dashboard-crucible-progress">${crucible.is_max_progress ? 'Ready' : `${crucible.progress || 0}/${crucible.max_progress || 25}`}</div>
    </div>`;
  }).join('');

  return `Crucible Forge · ${completed}/${crucibles.length} crucibles ready
    <div class="stats">${crucibleStatus}</div>
  `.trim();
};
