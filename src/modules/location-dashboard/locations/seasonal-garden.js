/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
const getSeasonalGardenText = (quests) => {
  if (! quests.QuestSeasonalGarden) {
    return '';
  }

  const quest = {
    amp: quests?.QuestSeasonalGarden?.amp || 0,
    max: quests?.QuestSeasonalGarden?.max || 0,
  };

  return `Amp: ${quest.amp}% / ${quest.max}%`;
};

/**
 * Set the Seasonal Garden data.
 *
 * @return {Object} The Seasonal Garden data.
 */
const setSeasonalGardenData = () => {
  const quest = {
    amp: 0,
    max: 0,
  };

  const amp = document.querySelector('.seasonalGardenHUD-currentAmplifier-value');
  if (amp) {
    quest.amp = Number.parseInt(amp.textContent, 10);
  }

  const max = document.querySelector('.seasonalGardenHUD-maxAmplifier-value');
  if (max) {
    quest.max = Number.parseInt(max.textContent, 10);
  }

  return quest;
};

export {
  getSeasonalGardenText,
  setSeasonalGardenData
};
