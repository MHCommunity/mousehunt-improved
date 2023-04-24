export default (quests) => {
  if (! quests.QuestFloatingIslands || ! quests.QuestFloatingIslands.hunting_site_atts) {
    return '';
  }

  const quest = {
    activated_island_mod_types: quests?.QuestFloatingIslands?.hunting_site_atts?.activated_island_mod_types || null,
    island_power_type: quests?.QuestFloatingIslands?.hunting_site_atts?.island_power_type || null,
    island_term: quests?.QuestFloatingIslands?.hunting_site_atts?.island_term || null,
    hunts_remaining: quests?.QuestFloatingIslands?.hunting_site_atts?.hunts_remaining || null,
  };

  const types = quest.activated_island_mod_types.join('').replaceAll('loot_cache', '🔑️');

  return `${quest.island_power_type} ${quest.island_term} (${types}) - ${quest.hunts_remaining} hunts remaining`;
};
