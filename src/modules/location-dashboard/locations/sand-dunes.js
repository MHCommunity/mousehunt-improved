/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestSandDunes) {
    return '';
  }

  const quest = quests.QuestSandDunes;
  const twistedText = quest.is_normal ? 'Not twisted' : 'Twisted';

  if (quest?.is_normal) {
    return `${twistedText} · ${quest?.minigame?.has_stampede ? 'Stampeding' : 'Not stampeding'}`;
  }

  return `${twistedText} · ${quest?.minigame?.salt_charms_used || 0} salt`;
};
