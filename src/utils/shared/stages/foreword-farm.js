/**
 * Get the Foreword Farm stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const states = {
    no_plants: 'No Plants',
    one_plant: 'One Plant',
    two_plants: 'Two Plants',
    three_plants: 'Three Plants',
    three_papyrus: 'Three Papyrus',
    boss: 'Boss',
  };

  const stage = states[quests.QuestForewordFarm?.mice_state] ?? null;
  return { data: stage, live: stage };
};
