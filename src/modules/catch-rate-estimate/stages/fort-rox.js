/**
 * Get the Fort Rox stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const nightStages = {
    stage_one: 'Twilight',
    stage_two: 'Midnight',
    stage_three: 'Pitch',
    stage_four: 'Utter Darkness',
    stage_five: 'First Light',
  };

  const quest = quests.QuestFortRox;

  let stage = { day: 'Day', dawn: 'Dawn' }[quest.current_phase] ?? null;
  if ('lair' === quest.current_phase || quest.is_lair) {
    stage = 'Heart of the Meteor';
  } else if ('night' === quest.current_phase) {
    stage = nightStages[quest.current_stage] ?? null;
  }

  return { data: stage, live: stage };
};
