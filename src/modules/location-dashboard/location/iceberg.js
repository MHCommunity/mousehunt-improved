/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestIceberg) {
    return '';
  }

  const quest = {
    phase: quests.QuestIceberg.current_phase || 'Iceberg',
    progress: quests.QuestIceberg.user_progress || 0,
    hunts: quests.QuestIceberg.turns_taken || 0,
  };

  return `${quest.phase}: ${quest.progress} ft.<div class="stats">Hunt #${quest.hunts}</div>`;
};
