// The mice in each wave, as the HUD groups them.
const waveMice = {
  1: ['desert_warrior_weak', 'desert_scout_weak', 'desert_archer_weak'],
  2: ['desert_warrior', 'desert_scout', 'desert_archer', 'desert_cavalry', 'desert_mage'],
  3: ['desert_warrior_epic', 'desert_scout_epic', 'desert_archer_epic', 'desert_cavalry_strong', 'desert_mage_strong', 'desert_artillery'],
  4: ['desert_elite_gaurd', 'desert_boss'],
  portal: ['desert_elite_gaurd', 'desert_artillery_commander'],
};

/**
 * Get the Fiery Warpath state.
 *
 * @param {Object} context             The stager context.
 * @param {Object} context.viewingAtts The user's viewing attributes.
 *
 * @return {Object} The wave, the mice left in it, the streak, and the morale.
 */
const getFieryWarpathState = ({ viewingAtts }) => {
  const warpath = viewingAtts.desert_warpath;
  const mice = warpath.mice || {};
  const getQuantity = (type) => Number(mice[type]?.quantity) || 0;

  return {
    wave: warpath.wave,
    isPortal: 'portal' === warpath.wave,
    remaining: (waveMice[warpath.wave] || []).reduce((total, type) => total + getQuantity(type), 0),
    guardsRemaining: getQuantity('desert_elite_gaurd'),
    streak: Number(warpath.streak_quantity) || 0,
    morale: Number(warpath.morale_percent) || 0,
  };
};

/**
 * Get the Fiery Warpath stage.
 *
 * @param {Object} context The stager context.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const { wave, isPortal } = getFieryWarpathState(context);
  const stage = isPortal ? 'Portal' : `Wave ${wave}`;
  return { data: stage, live: stage };
};

export { getFieryWarpathState };
