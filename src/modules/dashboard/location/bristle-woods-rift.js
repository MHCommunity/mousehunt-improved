export default (quests) => {
  const looted = quests.QuestRiftBristleWoods.progress_goal - quests.QuestRiftBristleWoods.progress_remaining;
  return `${quests.QuestRiftBristleWoods.chamber_name}, ${looted} / ${quests.QuestRiftBristleWoods.progress_goal} loot`;
};
