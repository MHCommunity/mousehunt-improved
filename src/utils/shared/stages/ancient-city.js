// The bosses of the districts that have one. The tier 3 bosses are attracted half the time when active.
const bosses = {
  Sanctum: { type: 'manaforge_weapon_master', share: 0.5 },
  Library: { type: 'soul_binder', share: 0.5 },
  Manaforge: { type: 'manaforge_smith', share: 0.5 },
  Minotaur: { type: 'retired_minotaur', share: null },
};

/**
 * Get the district's boss and whether it can be attracted.
 *
 * @param {string} district  The district key.
 * @param {string} bossState The quest's boss state, like 'active', 'defeated', or 'hiddenDistrict napping'.
 *
 * @return {Object|null} The boss, or null for districts without one.
 */
const getBoss = (district, bossState = '') => {
  const boss = bosses[district];
  if (!boss) {
    return null;
  }

  // The Minotaur's lair is a hidden district, where the boss is awake unless it's napping.
  const isActive = 'active' === bossState || (bossState.includes('hiddenDistrict') && !bossState.includes('napping'));

  return { ...boss, isActive };
};

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

  return { data: stage, live: stage, boss: getBoss(district, quests.QuestAncientCity.boss) };
};
