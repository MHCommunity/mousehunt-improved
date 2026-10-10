/**
 * Get the Epilogue Falls stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestEpilogueFalls;
  if (!quest.on_rapids) {
    // MH-Tools doesn't have the shore.
    return { data: null, live: 'Shore' };
  }

  const zone = quest.rapids.zone_data;
  const live = { waterfall_zone: 'Waterfall', grotto_zone: 'Grotto' }[zone.type] ?? 'Rapids';

  return { data: zone.name.replace(' Zone', ''), live };
};
