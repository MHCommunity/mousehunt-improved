export function getSeasonalGardenText(quests) {
  if (! quests.QuestSeasonalGarden) {
    return '';
  }

  const quest = {
    amp: quests?.QuestSeasonalGarden?.amp || 0,
    max: quests?.QuestSeasonalGarden?.max || 0
  };

  return `Amp: ${quest.amp}% / ${quest.max}%`;
}

export function setSeasonalGardenData() {
  const quest = {
    amp: 0,
    max: 0
  };

  const amp = document.querySelector('.seasonalGardenHUD-currentAmplifier-value');
  if (amp) {
    quest.amp = parseInt(amp.textContent, 10);
  }

  const max = document.querySelector('.seasonalGardenHUD-maxAmplifier-value');
  if (max) {
    quest.max = parseInt(max.textContent, 10);
  }

  return quest;
}
