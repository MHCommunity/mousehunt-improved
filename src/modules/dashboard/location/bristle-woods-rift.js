export default (quests) => {
  if (! quests.QuestRiftBristleWoods) {
    return '';
  }

  const quest = {
    progress_goal: quests?.QuestRiftBristleWoods?.progress_goal || null,
    progress_remaining: quests?.QuestRiftBristleWoods?.progress_remaining || null,
    chamber_name: quests?.QuestRiftBristleWoods?.chamber_name || null,
  };

  return `${quest.chamber_name}, ${quest.progress_goal - quest.progress_remaining} / ${quest.progress_goal} loot`;
};
