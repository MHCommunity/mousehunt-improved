/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestPollutionOutbreak) {
    return '';
  }

  const crude = quests.QuestPollutionOutbreak?.items?.crude_pollutinum_stat_item?.quantity || 0;
  const refined = quests.QuestPollutionOutbreak?.items?.refined_pollutinum_stat_item?.quantity || 0;
  const max = quests.QuestPollutionOutbreak?.max_pollutinum || 0;

  return `${crude.toLocaleString()}/${max} Pollutinum<div class="stats">${refined.toLocaleString()} Refined Pollutinum</div>`;
};
