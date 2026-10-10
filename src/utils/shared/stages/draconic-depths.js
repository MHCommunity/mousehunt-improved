import { capitalize } from './utils';

/**
 * Get the Draconic Depths state.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The cavern, its loot tier and depth range, and the crucibles.
 */
const getDraconicDepthsState = ({ quests }) => {
  const quest = quests.QuestDraconicDepths;
  const crucibles = quest.crucible_forge?.crucibles || [];

  if (!quest.in_cavern) {
    return { inCavern: false, crucibles };
  }

  const { cavern } = quest;
  const { current_tier: tier, tier_data: tiers } = cavern.loot_tier;
  const range = tier < tiers.length ? `${tiers[tier - 1].threshold}-${tiers[tier].threshold - 1}` : `${tiers[tier - 1].threshold}+`;

  return {
    inCavern: true,
    crucibles,
    cavernName: cavern.name,
    category: 'elemental_dragon_den' === cavern.type ? 'Elemental' : capitalize(cavern.category),
    huntsRemaining: cavern.hunts_remaining || 0,
    tier,
    range,
  };
};

/**
 * Get the Draconic Depths stage.
 *
 * @param {Object} context The stager context.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const state = getDraconicDepthsState(context);
  const stage = state.inCavern ? `Cavern: ${state.category} ${state.range}` : 'Crucible Forge';

  return { data: stage, live: stage };
};

export { getDraconicDepthsState };
