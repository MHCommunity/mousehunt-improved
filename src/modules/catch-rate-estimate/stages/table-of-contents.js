/**
 * Get the Table of Contents stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestTableOfContents;
  if (!quest.is_writing) {
    return { data: 'Not Writing', live: 'Not Writing' };
  }

  return {
    data: 'encyclopedia' === quest.progress?.type ? 'Encyclopedia' : 'Pre-Encyclopedia',
    live: quest.current_book?.volume > 0 ? 'Encyclopedia' : 'Pre-Encyclopedia',
  };
};
