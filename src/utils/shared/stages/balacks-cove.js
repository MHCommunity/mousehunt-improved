/**
 * Get the Balack's Cove stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const stage = { low: 'Low Tide', med: 'Medium Tide', high: 'High Tide' }[quests.QuestBalacksCove?.tide?.level] ?? null;
  return { data: stage, live: stage };
};
