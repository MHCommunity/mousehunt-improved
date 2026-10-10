/**
 * Get the Labyrinth stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestLabyrinth;
  if ('hallway' !== quest.status) {
    // MHCT doesn't record intersections.
    return { data: 'Intersection', live: null };
  }

  const hallway = quest.hallway_name.slice(quest.hallway_name.indexOf(' ') + 1).replace(/ hallway/i, '');
  return { data: hallway, live: hallway };
};
