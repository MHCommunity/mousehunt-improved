/**
 * Get the Sand Dunes and Sand Crypts stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestSandDunes;
  if (false === quest.is_normal) {
    return { data: '-', live: undefined, isTwisted: true };
  }

  const stage = quest.minigame.has_stampede ? 'Stampede' : 'No Stampede';
  return { data: stage, live: stage };
};
