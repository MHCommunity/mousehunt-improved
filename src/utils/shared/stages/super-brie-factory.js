/**
 * Get the SUPER|brie+ Factory stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 * @param {string} context.bait   The bait name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests, bait }) => {
  const rooms = {
    pumping_room: 'Pump Room',
    mixing_room: 'Mixing Room',
    break_room: 'Break Room',
    quality_assurance_room: 'QA Room',
  };

  const atts = quests.QuestSuperBrieFactory.factory_atts;

  let stage = 'Any Room';
  if (true === atts.boss_warning) {
    stage = 'Boss';
  } else if (rooms[atts.current_room] && bait?.includes('Coggy Colby')) {
    stage = rooms[atts.current_room];
  }

  return { data: stage, live: stage };
};
