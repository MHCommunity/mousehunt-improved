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

  const q = quests.QuestPollutionOutbreak;
  return `${q.items.crude_pollutinum_stat_item.quantity}/${q.max_pollutinum} Pollutinum, ${q.refined_pollutinum} refined`;
};
