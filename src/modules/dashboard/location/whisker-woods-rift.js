export default (quests) => {
  if (! (quests.QuestRiftWhiskerWoods && quests.QuestRiftWhiskerWoods.zones)) {
    return '';
  }

  const quest = {
    clearing: quests?.QuestRiftWhiskerWoods?.zones?.clearing?.level || 0,
    lagoon: quests?.QuestRiftWhiskerWoods?.zones?.lagoon?.level || 0,
    tree: quests?.QuestRiftWhiskerWoods?.zones?.tree?.level || 0,
  };

  return `Rage: ${quest.clearing} / ${quest.lagoon} / ${quest.tree}`;
};
