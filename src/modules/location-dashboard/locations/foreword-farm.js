/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests.QuestForewordFarm) {
    return '';
  }

  const plants = {};
  for (const plot of quests.QuestForewordFarm.plots || []) {
    if (plot.is_growing && plot.plant?.name) {
      plants[plot.plant.name] = (plants[plot.plant.name] || 0) + 1;
    }
  }

  const growing = Object.entries(plants).map(([name, count]) => `${count} ${name}`);

  return growing.length > 0 ? `Growing ${growing.join(', ')}` : 'No plants growing';
};
