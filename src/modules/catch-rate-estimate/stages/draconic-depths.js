import { capitalize } from './utils';

/**
 * Get the Draconic Depths stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestDraconicDepths;
  if (!quest.in_cavern) {
    return { data: 'Crucible Forge', live: 'Crucible Forge' };
  }

  const { current_tier: currentTier, tier_data: tiers } = quest.cavern.loot_tier;
  const range = currentTier < tiers.length ? `${tiers[currentTier - 1].threshold}-${tiers[currentTier].threshold - 1}` : `${tiers[currentTier - 1].threshold}+`;
  const category = 'elemental_dragon_den' === quest.cavern.type ? 'Elemental' : capitalize(quest.cavern.category);
  const stage = `Cavern: ${category} ${range}`;

  return { data: stage, live: stage };
};
