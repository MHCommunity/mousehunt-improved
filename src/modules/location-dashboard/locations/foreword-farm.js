/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestForewordFarm) {
    return '';
  }
  const recipes = user.enviroment_atts?.recipes || [];
  const plants = recipes.reduce((acc, recipe) => {
    if (recipe.type) {
      acc[recipe.type] = 0;
    }

    return acc;
  }, {});

  quests.QuestForewordFarm.plots.forEach((plot) => {
    const name = plot.is_growing ? plot.plant.type : 'empty';
    plants[name] += 1;
  });

  if (plants.empty === 3) {
    return 'No plants growing';
  }

  let returnText = '';

  Object.entries(plants).forEach(([type, count]) => {
    if (count > 0) {
      const recipeName = recipes.find(recipe => recipe.type === type)?.name;
      if (recipeName) {
        returnText += `${count} ${recipeName}, `;
      }
    }
  });

  // remove trailing comma
  returnText = returnText.trim().replace(/,$/, '');

  return `Growing ${returnText}`;
};
