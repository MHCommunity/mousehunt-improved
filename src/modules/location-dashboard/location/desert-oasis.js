/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestLivingGarden) {
    return '';
  }

  const quest = quests.QuestLivingGarden;

  const twistedText = quest.is_normal ? 'Not twisted' : 'Twisted';

  if ('dumped' === quest?.minigame?.vials_state && quest?.minigame?.timer) {
    return `${twistedText} · Pouring${quest?.minigame.timer ? ` for ${quest?.minigame.timer} hunts` : ''}`;
  }

  return `${twistedText}`;
};
