/**
 * Get the Floating Islands stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 * @param {string} context.bait   The bait name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests, bait }) => {
  const shortMods = {
    'Ancient Jade Stockpile': 'Jade',
    'Empyrean Seal Stowage': 'Emp Seal',
    'Ore and Glass Deposit': 'Glass + Ore',
    'Sky Pirate Den': 'Pirates',
  };

  const hsa = quests.QuestFloatingIslands.hunting_site_atts;
  const powerType = /^(Launch Pad|\w+)/.exec(hsa.island_name)?.[1];
  const mods = hsa.activated_island_mod_types || [];
  const countMods = (type) => mods.filter((mod) => mod === type).length;

  let stage = 'Launch Pad';
  if (hsa.is_low_tier_island) {
    stage = `${powerType} Low`;
  } else if (hsa.is_high_tier_island) {
    stage = `${powerType} High`;
  } else if (hsa.is_vault_island) {
    stage = `${powerType} Palace`;
  }

  if (hsa.is_enemy_encounter) {
    if (hsa.is_low_tier_island) {
      return { data: 'Sky Wardens', live: 'Warden' };
    }

    if (hsa.is_high_tier_island) {
      return { data: 'Sky Paragons', live: `${powerType} Paragon` };
    }

    if (hsa.is_vault_island) {
      return { data: 'Empress', live: 'Empress' };
    }

    return { data: null, live: `${stage} Enemy Encounter` };
  }

  if ('Sky Pirate Swiss Cheese' === bait) {
    const pirates = `${hsa.is_vault_island ? 'Palace' : 'Low|High'} - ${countMods('sky_pirates')}x Pirates`;
    return { data: pirates, live: pirates };
  }

  const lootCaches = countMods('loot_cache');
  if (bait?.endsWith('Cloud Cheesecake') && lootCaches >= 2) {
    stage += ` - ${lootCaches}x Loot`;
  } else if (hsa.is_vault_island) {
    const counts = {};
    for (const mod of mods) {
      counts[mod] = (counts[mod] || 0) + 1;
    }

    for (const [type, count] of Object.entries(counts)) {
      const name = hsa.island_mod_panels.find((panel) => panel.type === type)?.name;
      if (count >= 3 && name) {
        stage += ` - ${count}x ${shortMods[name] ?? name}`;
      }
    }
  }

  return { data: stage, live: stage };
};
