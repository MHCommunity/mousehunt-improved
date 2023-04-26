export default (quests) => {
  if (! quests.QuestLivingGarden) {
    return '';
  }

  const twistedText = quests.QuestLivingGarden.is_normal ? 'Not twisted' : 'Twisted';
  return `${twistedText}, ${quests.QuestLivingGarden.minigame?.bucket_state} bucket`;
};
