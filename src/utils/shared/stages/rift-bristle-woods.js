/**
 * Get the Bristle Woods Rift stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const quest = quests.QuestRiftBristleWoods;
  const chamber = 'Rift Acolyte Tower' === quest.chamber_name ? 'Entrance' : quest.chamber_name;

  const data = [chamber];
  if ('active' === quest.status_effects?.ng) {
    data.push("(Paladin's Bane)");
  }

  if ('active' === quest.status_effects?.st) {
    data.push('(Pursued)');
  }

  return { data: data.join(' '), live: chamber };
};
