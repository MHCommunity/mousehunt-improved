/**
 * Get the Bountiful Beanstalk stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestBountifulBeanstalk;
  if (!quest.in_castle) {
    const stage = quest.beanstalk.is_boss_encounter ? 'Beanstalk Boss' : 'Beanstalk';
    return { data: stage, live: stage };
  }

  const { castle } = quest;
  const floor = castle.current_floor.name.replace(/\sFloor$/, '');
  const room = castle.current_room.name
    .replace(/^(Standard|Super|Extreme|Ultimate)/, '')
    .replace(/(Bean )?Room$/, '')
    .trim();

  return {
    data: castle.is_boss_encounter ? 'Castle Giants' : floor,
    live: `${floor}${castle.is_boss_encounter ? ' Giant' : ''} - ${room}`,
  };
};
