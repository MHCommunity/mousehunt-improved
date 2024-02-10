/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  // salt level, is stampede
  if (! quests.QuestSandDunes) {
    return '';
  }

  return quests.QuestSandDunes.minigame?.has_stampede ? 'Stampeding' : 'Not stampeding';
};
