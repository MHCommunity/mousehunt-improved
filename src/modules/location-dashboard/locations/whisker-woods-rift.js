/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! (quests.QuestRiftWhiskerWoods && quests.QuestRiftWhiskerWoods.zones)) {
    return '';
  }

  const zones = quests.QuestRiftWhiskerWoods.zones || {};
  return `Rage: ${zones?.clearing?.level || 0} / ${zones?.lagoon?.level || 0} / ${zones?.tree?.level || 0}`;
};
