/**
 * Get the Afterword Acres stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const tiers = { tier_1: '1x', tier_2: '2x', tier_3: '4x', tier_4: '8x' };
  const stage = tiers[quests.QuestAfterwordAcres?.blight_tier] ?? null;
  return { data: stage, live: stage };
};
