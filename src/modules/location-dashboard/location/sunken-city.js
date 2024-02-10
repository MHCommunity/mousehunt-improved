/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestSunkenCity) {
    return;
  }

  const oxygen = quests.QuestSunkenCity.items?.oxygen_stat_item || 0;

  if (! quests.QuestSunkenCity.is_diving) {
    const canDive = quests.QuestSunkenCity.can_dive ? 'can dive' : 'cannot dive';
    return `Docked (${canDive}), ${oxygen} O₂`;
  }

  const zone = quests.QuestSunkenCity.zone_name;
  const depth = quests.QuestSunkenCity.distance;

  return `${zone}, ${depth}m, ${oxygen} O₂`;
};
