/**
 * Get the Mousoleum stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const stage = quests.QuestMousoleum.has_wall ? 'Has Wall' : 'No Wall';
  return { data: stage, live: stage };
};
