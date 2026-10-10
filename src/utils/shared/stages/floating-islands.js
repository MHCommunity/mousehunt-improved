const shortMods = {
  'Ancient Jade Stockpile': 'Jade',
  'Empyrean Seal Stowage': 'Emp Seal',
  'Ore and Glass Deposit': 'Glass + Ore',
  'Sky Pirate Den': 'Pirates',
};

/**
 * Get the Floating Islands state.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The island's power type and tier, its mods, and the hunt's progress.
 */
const getFloatingIslandsState = ({ quests }) => {
  const hsa = quests.QuestFloatingIslands.hunting_site_atts;

  let tier = 'launch_pad';
  if (hsa.is_low_tier_island) {
    tier = 'low';
  } else if (hsa.is_high_tier_island) {
    tier = 'high';
  } else if (hsa.is_vault_island) {
    tier = 'palace';
  }

  return {
    tier,
    powerType: /^(Launch Pad|\w+)/.exec(hsa.island_name)?.[1],
    isEnemyEncounter: Boolean(hsa.is_enemy_encounter),
    mods: hsa.activated_island_mod_types || [],
    panels: hsa.island_mod_panels || [],
    huntsRemaining: hsa.hunts_remaining || 0,
    wardensCaught: hsa.sky_wardens_caught || 0,
  };
};

/**
 * Get the Floating Islands stage.
 *
 * @param {Object} context      The stager context.
 * @param {string} context.bait The bait name.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const { bait } = context;
  const { tier, powerType, isEnemyEncounter, mods, panels } = getFloatingIslandsState(context);
  const countMods = (type) => mods.filter((mod) => mod === type).length;

  const tierNames = { low: 'Low', high: 'High', palace: 'Palace' };
  let stage = tierNames[tier] ? `${powerType} ${tierNames[tier]}` : 'Launch Pad';

  if (isEnemyEncounter) {
    if ('low' === tier) {
      return { data: 'Sky Wardens', live: 'Warden' };
    }

    if ('high' === tier) {
      return { data: 'Sky Paragons', live: `${powerType} Paragon` };
    }

    if ('palace' === tier) {
      return { data: 'Empress', live: 'Empress' };
    }

    return { data: null, live: `${stage} Enemy Encounter` };
  }

  if ('Sky Pirate Swiss Cheese' === bait) {
    const pirates = `${'palace' === tier ? 'Palace' : 'Low|High'} - ${countMods('sky_pirates')}x Pirates`;
    return { data: pirates, live: pirates };
  }

  const lootCaches = countMods('loot_cache');
  if (bait?.endsWith('Cloud Cheesecake') && lootCaches >= 2) {
    stage += ` - ${lootCaches}x Loot`;
  } else if ('palace' === tier) {
    const counts = {};
    for (const mod of mods) {
      counts[mod] = (counts[mod] || 0) + 1;
    }

    for (const [type, count] of Object.entries(counts)) {
      const name = panels.find((panel) => panel.type === type)?.name;
      if (count >= 3 && name) {
        stage += ` - ${count}x ${shortMods[name] ?? name}`;
      }
    }
  }

  return { data: stage, live: stage };
};

export { getFloatingIslandsState };
