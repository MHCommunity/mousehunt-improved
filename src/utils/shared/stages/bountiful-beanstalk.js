/**
 * Get the Bountiful Beanstalk state.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} Where the hunter is, the room, and the hunt's progress.
 */
const getBountifulBeanstalkState = ({ quests }) => {
  const quest = quests.QuestBountifulBeanstalk;
  if (!quest.in_castle) {
    return {
      inCastle: false,
      zone: quest.beanstalk?.current_zone?.name || '',
      isBoss: Boolean(quest.beanstalk?.is_boss_encounter),
      huntsRemainingText: quest.beanstalk?.hunts_remaining_text || '',
    };
  }

  const { castle } = quest;

  return {
    inCastle: true,
    floor: castle.current_floor.name.replace(/\sFloor$/, ''),
    room: castle.current_room.name
      .replace(/^(Standard|Super|Extreme|Ultimate)/, '')
      .replace(/(Bean )?Room$/, '')
      .trim(),
    roomQuality: castle.current_room.type.replace('_room', '').split('_').pop().trim(),
    isBoss: Boolean(castle.is_boss_encounter),
    isChase: Boolean(castle.is_boss_chase),
    noise: castle.noise_level || 0,
    maxNoise: castle.max_noise_level || 0,
    huntsRemainingText: castle.hunts_remaining_text || '',
    embellishments: (quest.embellishments || []).filter((item) => item.is_active).map((item) => item.type),
  };
};

/**
 * Get the Bountiful Beanstalk stage.
 *
 * @param {Object} context The stager context.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const state = getBountifulBeanstalkState(context);
  if (!state.inCastle) {
    const stage = state.isBoss ? 'Beanstalk Boss' : 'Beanstalk';
    return { data: stage, live: stage };
  }

  return {
    data: state.isBoss ? 'Castle Giants' : state.floor,
    live: `${state.floor}${state.isBoss ? ' Giant' : ''} - ${state.room}`,
  };
};

export { getBountifulBeanstalkState };
