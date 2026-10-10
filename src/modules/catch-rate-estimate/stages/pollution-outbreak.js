/**
 * Get the Toxic Spill stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  // Titles, as MH-Tools and MHCT name them.
  const titles = {
    hero: ['Hero', 'Hero'],
    knight: ['Knight', 'Knight'],
    lord_lady: ['Lord/Lady', 'Lord/Lady'],
    baron_baroness: ['Baron/Baroness', 'Baron/Baroness'],
    count_countess: ['Count/Countess', 'Count/Countess'],
    duke_dutchess: ['Duke/Duchess', 'Duke/Duchess'],
    grand_duke: ['Grand Duke/Grand Duchess', 'Grand Duke/Duchess'],
    archduke_archduchess: ['Archduke/Archduchess', 'Archduke/Archduchess'],
  };


  const active = Object.entries(quests.QuestPollutionOutbreak?.titles || {}).find(([, status]) => status.active)?.[0];
  const [data, live] = titles[active] ?? [null, null];

  return { data, live };
};
