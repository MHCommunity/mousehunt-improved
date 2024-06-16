/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestRiftBurroughs) {
    return '';
  }

  return `Mist: ${quests.QuestRiftBurroughs?.mist_released || 0} / 20`;
};
