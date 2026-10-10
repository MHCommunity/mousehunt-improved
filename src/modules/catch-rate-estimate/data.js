import { doRequest, getCurrentLocation, getData } from '@utils';
import { getFieryWarpathState } from '@utils/shared/stages/desert-warpath';

let miceEffs;
let hasGottenEffs = false;
let items = null;
let miceGroups = null;

/**
 * Get the mice eff values.
 *
 * @return {Promise<Array>} The mice eff values.
 */
const getMiceEffectiveness = async () => {
  if (!hasGottenEffs) {
    miceEffs = await getData('effs');
    hasGottenEffs = true;
  }

  const response = await doRequest('managers/ajax/users/getmiceeffectiveness.php');

  return response?.effectiveness;
};

/**
 * Get the mouse data.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {Promise<Object>} The mouse data.
 */
const getMouse = async (mouseId) => {
  if (!miceEffs || !hasGottenEffs) {
    miceEffs = await getData('effs');
    hasGottenEffs = true;
  }

  // Find the mouse in the effs data. based on name.
  const mouse = miceEffs.find((m) => m.type === mouseId);

  return mouse;
};

/**
 * Get the mouse power.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {Promise<number>} The mouse power.
 */
const getMousePower = async (mouseId) => {
  const mouse = await getMouse(mouseId);
  if (!mouse || !mouse.effectivenesses) {
    return 0;
  }

  return mouse?.effectivenesses?.power;
};

/**
 * Get the mouse effectiveness.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {Promise<number>} The mouse effectiveness.
 */
const getMouseEffectiveness = async (mouseId) => {
  const mouse = await getMouse(mouseId);
  if (!mouse || !mouse.effectivenesses) {
    return 0;
  }

  return mouse.effectivenesses[user.trap_power_type_name.toLowerCase()];
};

/**
 * Load the item and mouse group data the special effects need.
 */
const loadSpecialEffectData = async () => {
  if (!items) {
    items = await getData('items');
  }

  if (!miceGroups) {
    miceGroups = await getData('cre-mice-groups');
  }
};

/**
 * Get the type of an equipped item.
 *
 * @param {number|string} id The item ID.
 *
 * @return {string|undefined} The item type.
 */
const getItemType = (id) => items.find((item) => item.id === Number.parseInt(id))?.type;

/**
 * Get a Fort Rox fort upgrade level.
 *
 * @param {string} upgrade The upgrade key, 'b' for the Ballista or 'c' for the Cannon.
 *
 * @return {number} The level.
 */
const getFortRoxLevel = (upgrade) => Number(user?.quests?.QuestFortRox?.fort?.[upgrade]?.level) || 0;

/**
 * Apply the area mechanics and items that change a mouse's power or effectiveness.
 *
 * These change the mouse itself, so they apply to the minluck as well as the catch rate.
 *
 * Props Maidenless @ github.com/MaidenlessINC/Maidenless-INC.
 *
 * @param {Object} options               The options.
 * @param {string} options.mouseType     The mouse type.
 * @param {number} options.mousePower    The mouse power.
 * @param {number} options.effectiveness The mouse effectiveness (0-1+).
 *
 * @return {Promise<Object>} The adjusted mousePower and effectiveness.
 */
const applyMouseEffects = async ({ mouseType, mousePower, effectiveness }) => {
  await loadSpecialEffectData();

  const charm = getItemType(user?.trinket_item_id);
  const weapon = getItemType(user?.weapon_item_id);
  const trapPowerType = user.trap_power_type_name.toLowerCase();

  // Guaranteed catches.
  const isGuaranteed = () => {
    mousePower = 0;
    effectiveness = 1;
  };

  switch (getCurrentLocation()) {
    case 'ancient_city':
      if ('retired_minotaur' === mouseType) {
        mousePower *= (user?.quests?.QuestAncientCity?.width || 100) / 100;
      } else if ('defeated' === user.quests.QuestAncientCity.boss && 'forgotten' === trapPowerType) {
        effectiveness += 1;
      }

      break;
    case 'claw_shot_city': // Using a Sheriff's Badge charm against the Bounty Hunter in Claw Shot City.
      if ('bounty_hunter' === mouseType && 'sheriff_badge_trinket' === charm) {
        isGuaranteed();
      }

      break;
    case 'crystal_library': // Zurreal the Enternal and not using Zurreal's Folly in the Crystal Library.
      if ('library_boss' === mouseType && 'zurreals_folly_weapon' !== weapon) {
        effectiveness = 0;
      }

      break;
    case 'desert_warpath': {
      // The Warmonger and Artillery Commander can't be caught while their guards remain.
      const { wave, guardsRemaining } = getFieryWarpathState({ viewingAtts: user.viewing_atts });
      if (guardsRemaining > 0 && (('desert_boss' === mouseType && 4 === Number(wave)) || ('desert_artillery_commander' === mouseType && 'portal' === wave))) {
        effectiveness = 0;
      }

      break;
    }
    case 'fort_rox':
      // By default the values in the sheet we use are set to balista level 1, so we want to reset them.
      if ((miceGroups.fort_rox?.weremice.includes(mouseType) && getFortRoxLevel('b') === 0) || (miceGroups.fort_rox?.cosmic.includes(mouseType) && getFortRoxLevel('c') === 0)) {
        mousePower *= 2;
      } else if (('nightmancer' === mouseType && getFortRoxLevel('b') === 3) || ('nightfire' === mouseType && getFortRoxLevel('c') === 3)) {
        isGuaranteed();
      } else if ('battering_ram_night' === mouseType && 'battering_ram_buster_weapon' === weapon) {
        // Battering Ram Buster weapon against Battering Ram mice.
        isGuaranteed();
      } else if ('heart_of_the_meteor' === mouseType) {
        // Heart of the Meteor gets weaker with each hunt.
        mousePower *= (user?.quests?.QuestFortRox?.lair_width || 100) / 100;
      }

      break;
    case 'rift_bristle_woods':
      // The Absolute Acolyte can't be caught until its sand is drained.
      if ('rift_acolyte' === mouseType && (user?.quests?.QuestRiftBristleWoods?.acolyte_sand || 0) > 0) {
        effectiveness = 0;
      }
      break;
    case 'sand_dunes': // Calculate power when salted in the Sand Crypts.
      if (miceGroups.sand_dunes?.includes(mouseType) && !user?.quests?.QuestSandDunes?.is_normal) {
        mousePower = calculatePowerWhenSalted(mousePower, user?.quests?.QuestSandDunes?.minigame?.salt_charms_used || 0, mouseType);
      }

      break;
    case 'sunken_city': // Ultimate Anchor Charm.
      if ('ultimate_anchoring_trinket' === charm) {
        isGuaranteed();
      }

      break;
  }

  return { mousePower, effectiveness };
};

/**
 * Get the minluck: the lowest luck that guarantees a catch with no power at all.
 *
 * Props tsitu @ github.com:tsitu/MH-Tools, and Beeejk and Neb for the float handling.
 *
 * @param {Object} options               The options.
 * @param {string} options.mouseType     The mouse type.
 * @param {number} options.mousePower    The mouse power.
 * @param {number} options.effectiveness The mouse effectiveness (0-1+).
 *
 * @return {Promise<number | '∞'>} The minluck.
 */
const getMinluck = async (options) => {
  const { mousePower, effectiveness } = await applyMouseEffects(options);

  if (effectiveness === 0) {
    return '∞';
  }

  const luckEffectiveness = Math.min(effectiveness, 1.4);
  const minluck = Math.ceil(Math.ceil(Math.sqrt(mousePower / 2)) / luckEffectiveness);
  if (minluck >= 9999) {
    return '∞';
  }

  // Floating point error can leave the result one short, so check that it actually guarantees a catch.
  return 2 * Math.pow(Math.floor(luckEffectiveness * minluck), 2) >= mousePower ? minluck : minluck + 1;
};

/**
 * Convert a rate to a percentage.
 *
 * @param {number} rate The rate.
 *
 * @return {string} The percentage.
 */
const getPercent = (rate) => {
  if (rate === 1) {
    return '100%';
  }

  return `${Math.max(0, rate * 100).toFixed(2)}%`;
};

const kingScarabThresholds = [0, 30, 40, 50];
const kingScarabCoefficients = [25000, 12500, 6500, 0];
const defaultThresholds = [0, 6, 7, 10, 14, 18, 23, 24, 27, 34, 44, 48, 50];
const defaultCoefficients = [50000, 40000, 20000, 10000, 5000, 2500, 1000, 1500, 1000, 500, 1000, 2000, 0];

/**
 * Calculate the power when salted.
 *
 * Props to tsitu's MH-Tools + Xellis. Https://github.com/tsitu/MH-Tools/commit/4fd2f225d9774ffd14d8c293c0a8fff0f3b16c24.
 *
 * @param {number} power     The current mouse power.
 * @param {number} salt      The salt level.
 * @param {string} mousetype The mouse type.
 *
 * @return {number} The salted power.
 */
const calculatePowerWhenSalted = (power, salt, mousetype) => {
  if (salt === 0) {
    return power;
  }

  const saltThresholds = 'king_scarab' === mousetype ? kingScarabThresholds : defaultThresholds;
  const saltCoefficients = 'king_scarab' === mousetype ? kingScarabCoefficients : defaultCoefficients;

  for (let i = 0; i < saltThresholds.length - 1; i++) {
    power -= Math.min(saltThresholds[i + 1] - saltThresholds[i], Math.max(0, salt - saltThresholds[i])) * saltCoefficients[i];
  }

  return power;
};

/**
 * Get the amplifier value for seasonal garden or zugzwang's tower.
 *
 * @return {number} The amplifier value.
 */
const getAmplifier = () => {
  return user.viewing_atts?.zzt_amplifier ?? 0;
};

/**
 * Get the catch rate.
 *
 * Props Maidenless @ github.com/MaidenlessINC/Maidenless-INC.
 *
 * @param {Object} options                The options.
 * @param {string} options.mouseType      The mouse type.
 * @param {number} options.mousePower     The mouse power.
 * @param {number} options.effectiveness  The mouse effectiveness.
 * @param {number} options.trapPower      The trap power.
 * @param {number} options.trapPowerBoost The trap power boost.
 * @param {number} options.trapLuck       The trap luck.
 * @param {number} options.trapPowerBonus The trap power bonus.
 * @param {Array}  options.trapAuras      The trap auras.
 *
 * @return {Promise<number>} The catch rate.
 */
const applySpecialEffectsAndGetCatchRate = async (options) => {
  const { mousePower, effectiveness } = await applyMouseEffects(options);
  let { mouseType, trapPower, trapPowerBoost, trapLuck, trapPowerBonus, trapAuras } = options;

  const charm = getItemType(user?.trinket_item_id);
  const weapon = getItemType(user?.weapon_item_id);
  const location = getCurrentLocation();

  // Location specific
  switch (location) {
    case 'desert_warpath':
      if (
        (miceGroups.fiery_warpath?.archers.includes(mouseType) && 'super_flame_march_archer_trinket' === charm) ||
        (miceGroups.fiery_warpath?.cavalry.includes(mouseType) && 'super_flame_march_cavalry_trinket' === charm) ||
        (miceGroups.fiery_warpath?.mages.includes(mouseType) && 'super_flame_march_mage_trinket' === charm) ||
        (miceGroups.fiery_warpath?.scouts.includes(mouseType) && 'super_flame_march_scout_trinket' === charm) ||
        (miceGroups.fiery_warpath?.warriors.includes(mouseType) && 'super_flame_march_warrior_trinket' === charm) ||
        (miceGroups.fiery_warpath?.commanders.includes(mouseType) && 'super_flame_march_commander_trinket' === charm)
      ) {
        trapPowerBonus += 50;
      }

      break;
    case 'zugzwang_tower': // Chess pieces.
      // Obvious Ambush & Blackstone Pass - each give +1800 Power on corresponding side, -2400 Power on opposite side.
      if (
        ('obvious_ambush_weapon' === weapon && miceGroups.zugzwang_tower?.technic.includes(mouseType)) ||
        ('blackstone_pass_weapon' === weapon && miceGroups.zugzwang_tower?.mystic.includes(mouseType))
      ) {
        trapPower += 1800;
        trapLuck += 6;
      } else if (
        ('obvious_ambush_weapon' === weapon && miceGroups.zugzwang_tower?.mystic.includes(mouseType)) ||
        ('blackstone_pass_weapon' === weapon && miceGroups.zugzwang_tower?.technic.includes(mouseType))
      ) {
        trapPower -= 2400;
        trapLuck -= 9;
      } else if (
        // Pawn Pinchers - each give +10920 Power and +51 luck on corresponding Pawn, -60 Power and -0.05 Luck on opposite Pawn.
        ('technic_low_weapon' === weapon && 'tech_pawn' === mouseType) ||
        ('mystic_low_weapon' === weapon && 'mystic_pawn' === mouseType)
      ) {
        trapPower += 10920;
        trapLuck += 51;
      } else if (('technic_low_weapon' === weapon && 'mystic_pawn' === mouseType) || ('mystic_low_weapon' === weapon && 'tech_pawn' === mouseType)) {
        trapPower -= 60;
        trapLuck -= 0.05;
      }
      // Rook Crumble Charm.
      if ('rook_crumble_trinket' === charm && miceGroups.zugzwang_tower?.rooks.includes(mouseType)) {
        trapPowerBonus += 300;
      }

      break;
  }

  // Dragon bane trinkets.
  if (miceGroups.dragon?.includes(mouseType)) {
    if (trapAuras.includes('QuestDragonsMightAura')) {
      trapPowerBonus += 300;
    }

    if ('dragonbane_trinket' === charm) {
      trapPowerBonus += 300;
    } else if ('super_dragonbane_trinket' === charm) {
      trapPowerBonus += 600;
    } else if ('extrme_dragonbane_trinket' === charm) {
      trapPowerBonus += 900;
    } else if ('ultimate_dragonbane_trinket' === charm) {
      trapPowerBonus += 1200;
    }
  }

  let power = Math.ceil(trapPower + trapPower * (trapPowerBonus / 100) + trapPowerBoost);
  if ('zugzwang_tower' === location) {
    power = Math.ceil((power * getAmplifier()) / 100);
  }

  // Calculate the catch rate before we apply the weapon effects.
  let catchRate = calculateCatchRate(mousePower, effectiveness, power, trapLuck);

  // Weapons that modify the catch rate directly after the catch rate is calculated.
  if ('zugzwang_ultimate_move_weapon' === weapon && ('zugzwang_tower' === location || 'seasonal_garden' === location) && getAmplifier() > 0) {
    catchRate += (1 - catchRate) * 0.5;
  } else if (
    'anniversary_acronym_weapon' === weapon ||
    'anniversary_ambush_weapon' === weapon ||
    'anniversary_ancient_box_trap_weapon' === weapon ||
    'anniversary_mouse_deathbot_weapon' === weapon ||
    'anniversary_reaper_perch_weapon' === weapon
  ) {
    catchRate += (1 - catchRate) * 0.1;
  } else if (
    'fort_rox' === location &&
    // Weremice get a 50% auto catch with Ballista 2 or 3, and Cosmic Critters with Cannon 2 or 3.
    ((miceGroups.fort_rox?.weremice.includes(mouseType) && getFortRoxLevel('b') >= 2) || (miceGroups.fort_rox?.cosmic.includes(mouseType) && getFortRoxLevel('c') >= 2))
  ) {
    catchRate += (1 - catchRate) * 0.5;
  }

  return catchRate;
};

/**
 * Calculate the catch rate.
 *
 * Props tsitu @ github.com:tsitu/MH-Tools.
 *
 *
 * @param {number} mousePower    The mouse power.
 * @param {number} effectiveness The mouse effectiveness.
 * @param {number} power         The trap power.
 * @param {number} luck          The trap luck.
 *
 * @return {number} The catch rate.
 */
const calculateCatchRate = (mousePower, effectiveness, power, luck) => {
  return Math.min(1, (effectiveness * power + 2 * Math.pow(Math.floor(Math.min(effectiveness, 1.4) * luck), 2)) / (effectiveness * power + mousePower));
};

/**
 * Get the catch rate.
 *
 * @param {Object} options                The options.
 * @param {string} options.mouseType      The mouse type.
 * @param {number} options.mousePower     The mouse power.
 * @param {number} options.effectiveness  The mouse effectiveness.
 * @param {number} options.trapPower      The trap power.
 * @param {number} options.trapPowerBoost The trap power boost.
 * @param {number} options.trapLuck       The trap luck.
 * @param {number} options.trapPowerBonus The trap power bonus.
 * @param {Array}  options.trapAuras      The trap auras.
 *
 * @return {Promise<Object>} The catch rate.
 */
const getCatchRate = async (options) => {
  const rate = await applySpecialEffectsAndGetCatchRate(options);

  return {
    rate,
    percent: getPercent(rate),
  };
};

export { getCatchRate, getMiceEffectiveness, getMinluck, getMouseEffectiveness, getMousePower };
