/**
 * Get the Furoma Rift stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const chargeLevels = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  const quest = quests.QuestRiftFuroma;
  const battery = chargeLevels.indexOf(quest.droid?.charge_level?.replace('charge_level_', '')) + 1;

  let live = null;
  if (quest.view_state?.includes('trainingGrounds')) {
    live = 'Outside';
  } else if (quest.view_state?.includes('pagoda') && battery > 0) {
    live = `Battery ${battery}`;
  }

  return { data: quest.droid?.charge_level ? 'Pagoda' : 'Training Grounds', live };
};
