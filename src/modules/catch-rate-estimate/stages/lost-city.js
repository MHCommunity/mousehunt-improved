/**
 * Get the Lost City and Cursed City stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestLostCity;
  const isCursed = quest.minigame.is_cursed;

  return { data: isCursed ? 'Cursed' : 'Curse Lifted', live: isCursed ? 'Cursed' : 'Not Cursed', isTwisted: false === quest.is_normal };
};
