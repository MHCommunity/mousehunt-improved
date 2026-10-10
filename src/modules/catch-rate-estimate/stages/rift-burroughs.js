/**
 * Get the Burroughs Rift stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 * @param {string} context.bait   The bait name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests, bait }) => {
  const dataTiers = {
    tier_0: 'Mist Level 0',
    tier_1: 'Mist Level 1-5',
    tier_2: 'Mist Level 6-18',
    tier_3: 'Mist Level 19-20'
  };

  const liveTiers = {
    tier_0: 'Mist 0',
    tier_1: 'Mist 1-5',
    tier_2: 'Mist 6-18',
    tier_3: 'Mist 19-20'
  };

  const tier = quests.QuestRiftBurroughs?.mist_tier;

  // MH-Tools tracks Undead String Emmental as its own stage.
  return { data: 'Undead String Emmental' === bait ? bait : (dataTiers[tier] ?? null), live: liveTiers[tier] ?? null };
};
