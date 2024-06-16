/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestSunkenCity) {
    return '';
  }

  const quest = quests.QuestSunkenCity;
  const oxygen = quest?.items?.oxygen_stat_item || 0;

  if (! quest?.is_diving) {
    const canDive = quest?.can_dive ? 'can dive' : 'cannot dive';
    return `Docked (${canDive}), ${oxygen} O₂`;
  }

  const zone = quest?.zone_name || '';
  const depth = quest?.distance || 0;

  return `${zone}, ${depth}m, ${oxygen} O₂`;
};
