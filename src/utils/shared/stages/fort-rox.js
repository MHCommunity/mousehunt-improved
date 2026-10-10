const nightStages = {
  stage_one: 'Twilight',
  stage_two: 'Midnight',
  stage_three: 'Pitch',
  stage_four: 'Utter Darkness',
  stage_five: 'First Light',
};

/**
 * Get the Fort Rox state.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The phase, its name, and the wall's HP.
 */
const getFortRoxState = ({ quests }) => {
  const quest = quests.QuestFortRox;

  const isLair = 'lair' === quest.current_phase || Boolean(quest.is_lair);
  let phase = { day: 'Day', dawn: 'Dawn' }[quest.current_phase] ?? null;
  if (isLair) {
    phase = 'Heart of the Meteor';
  } else if ('night' === quest.current_phase) {
    phase = nightStages[quest.current_stage] ?? null;
  }

  return {
    isLair,
    phase,
    hp: quest.hp || 0,
    maxHp: quest.max_hp || 0,
  };
};

/**
 * Get the Fort Rox stage.
 *
 * @param {Object} context The stager context.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const { phase } = getFortRoxState(context);
  return { data: phase, live: phase };
};

export { getFortRoxState };
