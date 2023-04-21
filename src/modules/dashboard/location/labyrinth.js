export default (quests) => {
  let clueText = '';
  if (quests.QuestLabyrinth.clues) {
    const clueTexts = [];
    quests.QuestLabyrinth.clues.forEach((clue) => {
      const clueName = clue.name.replace('Farming', 'Farm').replace('Dead End', 'DEC');
      clueTexts.push(`${clue.quantity} ${clueName}`);
    });

    if (clueTexts.length > 0) {
      clueText = `- ${clueTexts.join(', ')}`;
    }
  }

  const hallwayName = quests.QuestLabyrinth.hallway_name.replace(' Hallway', '');
  const currentLocation = (quests.QuestLabyrinth.status === 'intersection') ? 'Intersection' : hallwayName;

  return `${currentLocation} ${clueText}`;
};
