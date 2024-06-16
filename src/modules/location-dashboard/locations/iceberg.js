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

  const quest = quests.QuestIceberg;

  return `${quest.current_phase || 'Iceberg'}: ${quest.user_progress || 0} ft.<div class="stats">Hunt #${quest.turns_taken || 0}</div>`;
};
