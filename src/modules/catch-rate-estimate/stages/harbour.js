/**
 * Get the Harbour stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestHarbour;
  const stage = 'searchStarted' === quest.status && !quest.can_claim ? 'On Bounty' : 'No Bounty';
  return { data: stage, live: stage };
};
