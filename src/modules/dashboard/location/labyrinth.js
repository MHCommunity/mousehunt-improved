export default (quests) => {
  if (! quests.QuestLabyrinth) {
    return '';
  }

  const quest = {
    clues: quests?.QuestLabyrinth?.clues || null,
    hallway_name: quests?.QuestLabyrinth?.hallway_name || null,
    status: quests?.QuestLabyrinth?.status || null,
  };

  let clueText = '';
  if (quest.clues) {
    const clueTexts = [];
    quest.clues.forEach((clue) => {
      const clueName = clue.name.replace('Farming', 'Farm').replace('Dead End', 'DEC');
      clueTexts.push(`${clue.quantity} ${clueName}`);
    });

    if (clueTexts.length > 0) {
      clueText = `: ${clueTexts.join(', ')} clues`;
    }
  }

  const hallwayName = quest.hallway_name.replace(' Hallway', '');
  const currentLocation = (quest.status === 'intersection') ? 'Intersection' : hallwayName;

  return `${currentLocation}${clueText}`;
};
