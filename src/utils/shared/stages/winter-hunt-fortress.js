/**
 * Get the Ice Fortress stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const isBroken = quests.QuestIceFortress?.shield?.is_broken;
  return { data: isBroken ? 'Boss' : '-', live: isBroken ? 'Shield Down' : 'Shield Up' };
};
