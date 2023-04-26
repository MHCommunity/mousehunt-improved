export default (quests) => {
  if (! quests.QuestForewordFarm) {
    return;
  }

  const plants = {
    empty: 0,
    ordinary_farm_plant: 0,
    legendary_farm_plant: 0,
    twisted_legendary_magic_farm_plant: 0,
  };

  quests.QuestForewordFarm.plots.forEach((plot) => {
    const name = plot.is_growing ? plot.plant.type : 'empty';
    plants[name] += 1;
  });

  if (plants.empty === 3) {
    return 'No plants growing';
  }

  let returnText = '';
  if (plants.ordinary_farm_plant > 0) {
    returnText += `${plants.ordinary_farm_plant} Mulch, `;
  }

  if (plants.legendary_farm_plant > 0) {
    returnText += `${plants.legendary_farm_plant} Papyrus, `;
  }

  if (plants.twisted_legendary_magic_farm_plant > 0) {
    returnText += `${plants.twisted_legendary_magic_farm_plant} Twisted Papyrus, `;
  }

  // remove trailing comma
  returnText = returnText.slice(0, -2);

  return `Growing ${returnText}`
};
