/**
 * Get the Afterword Acres state.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The blight level and its multiplier.
 */
const getAfterwordAcresState = ({ quests }) => {
  const quest = quests.QuestAfterwordAcres;

  return {
    multiplier: { tier_1: '1x', tier_2: '2x', tier_3: '4x', tier_4: '8x' }[quest.blight_tier] ?? null,
    blight: quest.blight_level_nice_number || '0',
    maxBlight: quest.max_blight_level || '0',
  };
};

/**
 * Get the Afterword Acres stage.
 *
 * @param {Object} context The stager context.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const { multiplier } = getAfterwordAcresState(context);
  return { data: multiplier, live: multiplier, label: multiplier && `Blight ${multiplier}` };
};

export { getAfterwordAcresState };
