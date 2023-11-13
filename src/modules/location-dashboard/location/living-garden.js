export default (quests) => {
  if (! quests.QuestLivingGarden) {
    return '';
  }

  const twistedText = quests.QuestLivingGarden.is_normal ? 'Not twisted' : 'Twisted';
  let minigameText = '';
  if ('drops' === quests.QuestLivingGarden.minigame?.type) {
    minigameText = `: Thirsty mice for ${quests.QuestLivingGarden.minigame?.estimate} hunts`;
  } else if ('hunts' === quests.QuestLivingGarden.minigame?.bucket_state) {
    minigameText = `: ${quests.QuestLivingGarden.minigame?.bucket_state} bucket`;
  }

  return `${twistedText}${minigameText}`;
};
