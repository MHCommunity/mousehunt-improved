/**
 * Get the Living Garden and Twisted Garden stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestLivingGarden;
  const isTwisted = false === quest.is_normal;
  const isPoured = 'dumped' === (isTwisted ? quest.minigame.vials_state : quest.minigame.bucket_state);

  return { data: isPoured ? 'Poured' : 'Not Poured', live: isPoured ? 'Pouring' : 'Not Pouring', isTwisted };
};
