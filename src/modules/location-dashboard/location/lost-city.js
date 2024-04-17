/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestLostCity) {
    return '';
  }

  const quest = quests.QuestLostCity;

  const twistedText = quest.is_normal ? 'Not twisted' : 'Twisted';

  if (! quest?.minigame?.is_cursed) {
    return `${twistedText} · Not cursed`;
  }

  const curses = quest?.minigame?.curses;
  const cursesText = curses
    .map((curse) => curse.name)
    .join(', ')
    .replaceAll('!', '')
    .replace(/,([^,]*)$/, '$1');

  return `${twistedText} · Cursed with ${cursesText}`;
};
