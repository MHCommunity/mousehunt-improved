export default (quests) => {
  const quest = {
    phase: quests.QuestIceberg.current_phase || 'Iceberg',
    progress: quests.QuestIceberg.user_progress || 0,
    hunts: quests.QuestIceberg.turns_taken || 0,
  };

  return `${quest.phase}: ${quest.progress} ft - Hunt #${quest.hunts}`;
};
