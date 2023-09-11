export default (quests) => {
  // salt level, is stampede
  if (! quests.QuestSandDunes) {
    return '';
  }

  return quests.QuestSandDunes.minigame?.has_stampede ? 'Stampeding' : 'Not stampeding';
};
