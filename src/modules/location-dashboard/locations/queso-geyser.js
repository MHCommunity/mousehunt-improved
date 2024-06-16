/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestQuesoGeyser) {
    return '';
  }

  const quest = quests.QuestQuesoGeyser;

  return `${quest?.state_name || 'Cork Gathering'}: ${quest?.hunts_remaining || 0} hunts remaining`;
};
