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

  if (! quests.QuestLostCity?.minigame?.is_cursed) {
    return 'Not cursed';
  }

  const curses = quests.QuestLostCity?.minigame?.curses;
  const cursesText = curses
    .map((curse) => curse.name)
    .join(', ')
    .replaceAll('!', '')
    .replace(/,([^,]*)$/, '$1');

  return `Cursed with ${cursesText}`;
};
