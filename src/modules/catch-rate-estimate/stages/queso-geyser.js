/**
 * Get the Queso Geyser stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestQuesoGeyser;
  const stage = { collecting: 'Cork Collecting', claim: 'Cork Collecting', corked: 'Pressure Building', eruption: quest.state_name }[quest.state] ?? null;
  return { data: stage, live: stage };
};
