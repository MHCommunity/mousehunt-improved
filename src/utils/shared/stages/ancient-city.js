/**
 * Get the Zokor stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const districts = {
    Garden: 'Farming 0+',
    Study: 'Scholar 15+',
    Shrine: 'Fealty 15+',
    Outskirts: 'Tech 15+',
    Room: 'Treasure 15+',
    Minotaur: 'Lair - Each 30+',
    Temple: 'Fealty 50+',
    Auditorium: 'Scholar 50+',
    Farmhouse: 'Farming 50+',
    Center: 'Tech 50+',
    Vault: 'Treasure 50+',
    Library: 'Scholar 80+',
    Manaforge: 'Tech 80+',
    Sanctum: 'Fealty 80+',
  };

  const districtName = quests.QuestAncientCity.district_name;
  const district = Object.keys(districts).find((key) => new RegExp(key, 'i').test(districtName));
  const stage = districts[district] ?? null;

  return { data: stage, live: stage };
};
