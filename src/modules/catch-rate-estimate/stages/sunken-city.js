/**
 * Get the depth band MHCT uses.
 *
 * @param {number} depth The depth, in meters.
 *
 * @return {string} The depth band.
 */
const getDepthBand = (depth) => {
  if (depth < 2000) {
    return '0-2km';
  }

  if (depth < 10_000) {
    return '2-10km';
  }

  if (depth < 15_000) {
    return '10-15km';
  }

  return depth < 25_000 ? '15-25km' : '25km+';
};

/**
 * Get the Sunken City stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestSunkenCity;
  if (!quest.is_diving) {
    return { data: 'Docked', live: 'Docked' };
  }

  return { data: quest.zone_name, live: `${quest.zone_name} ${getDepthBand(quest.distance)}` };
};
