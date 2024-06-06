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

  const quest = {
    mist_released: quests?.QuestRiftBurroughs?.mist_released || null,
  };

  return `Mist: ${quest.mist_released} / 20`;
};
