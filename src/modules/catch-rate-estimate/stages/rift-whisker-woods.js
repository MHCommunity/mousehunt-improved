const dataStatuses = { low: 'Low', high: 'Medium', boss: 'High' };

/**
 * Get the rage band MHCT uses for a zone.
 *
 * @param {number} level  The rage level.
 * @param {string} prefix The zone's prefix.
 *
 * @return {string} The rage band.
 */
const getRageBand = (level, prefix) => {
  if (level <= 24) {
    return `${prefix} 0-24`;
  }

  return level <= 49 ? `${prefix} 25-49` : `${prefix} 50`;
};

/**
 * Get the Whisker Woods Rift stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const { clearing, tree, lagoon } = quests.QuestRiftWhiskerWoods.zones;

  return {
    data: [clearing, tree, lagoon].map((zone) => dataStatuses[zone.status] ?? zone.status).join('/'),
    // MHCT stages by all three zones together, which comes back as a row for each.
    live: [getRageBand(Number(clearing.level), 'CC'), getRageBand(Number(tree.level), 'GGT'), getRageBand(Number(lagoon.level), 'DL')],
  };
};
