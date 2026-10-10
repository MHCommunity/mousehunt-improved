const floorTypes = ['Puppetry', 'Thievery', 'Melee', 'Bard', 'Magic', 'Noble', 'Dusty'];

// Mice that only appear on their own floor type. MHCT groups floors into ranges like
// "Floors 1-7", which spreads these mice across all 7 floor types.
const floorMice = new Set([
  'rift_gaunt_bard',
  'rift_gaunt_bard_champ',
  'rift_gaunt_dust',
  'rift_gaunt_dust_champ',
  'rift_gaunt_magic',
  'rift_gaunt_magic_champ',
  'rift_gaunt_melee',
  'rift_gaunt_melee_champ',
  'rift_gaunt_noble',
  'rift_gaunt_noble_champ',
  'rift_gaunt_puppet',
  'rift_gaunt_puppet_champ',
  'rift_gaunt_thief',
  'rift_gaunt_thief_champ',
]);

/**
 * Get the floor range for a floor.
 *
 * @param {number} floor The floor.
 *
 * @return {string} The floor range.
 */
const getRange = (floor) => {
  if (floor % 8 === 0) {
    return 'Eclipse';
  }

  if (floor <= 7) {
    return 'Floors 1-7';
  }

  if (floor <= 15) {
    return 'Floors 9-15';
  }

  return floor <= 23 ? 'Floors 17-23' : 'Floors 25-31+';
};

/**
 * Get the Valour Rift stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
const getStage = ({ quests }) => {
  const quest = quests.QuestRiftValour;
  if ('farming' === quest.state) {
    return { data: 'Outside', live: 'Outside' };
  }

  const floor = quest.floor || 1;
  const range = getRange(floor);
  const floorType = floorTypes[(quest.floor_type ? quest.floor_type - 1 : floor - 1) % 8];

  // The data splits floor ranges by floor type.
  const data = 'Eclipse' === range ? range : `${range} - ${floorType}`;

  return {
    data: quest.is_eclipse_mode ? `Umbra ${data}` : data,
    live: quest.is_eclipse_mode ? `UU ${range}` : range,
    liveFloorMice: 'Eclipse' === range ? null : floorMice,
  };
};

export default getStage;
