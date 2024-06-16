/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestMousoleum) {
    return '';
  }

  const quest = quests.QuestMousoleum;

  if (quest?.has_wall) {
    return `Wall · ${quest?.wall_health || 0}/${quest?.max_wall_health || 0} HP`;
  }

  return `No Wall · ${quest?.wall_materials || 0} planks`;
};
