export default (quests) => {
  const types = quests.QuestFloatingIslands.hunting_site_atts.activated_island_mod_types.join('').replaceAll('loot_cache', '🔑️');

  return `${quests.QuestFloatingIslands.hunting_site_atts.island_power_type} ${quests.QuestFloatingIslands.hunting_site_atts.island_term} (${types}) - ${quests.QuestFloatingIslands.hunting_site_atts.hunts_remaining} hunts remaining`;
};
