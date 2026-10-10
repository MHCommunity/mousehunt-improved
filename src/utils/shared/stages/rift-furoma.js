const chargeLevels = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/**
 * Get a battery's number from its charge level.
 *
 * @param {string} chargeLevel The charge level, like `charge_level_three`.
 *
 * @return {number} The battery number, or 0 if unknown.
 */
const getBatteryNumber = (chargeLevel) => chargeLevels.indexOf(`${chargeLevel || ''}`.replace('charge_level_', '')) + 1;

/**
 * Get the Furoma Rift state.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} Where the hunter is, their batteries, and their Enerchi.
 */
const getFuromaRiftState = ({ quests }) => {
  const quest = quests.QuestRiftFuroma;
  const batteries = quest.batteries || {};
  const chargeLevel = quest.droid?.charge_level;

  const unlockedBatteries = Object.keys(batteries).filter((battery) => batteries[battery].status?.includes('unlocked'));

  return {
    inPagoda: Boolean(quest.view_state?.includes('pagoda')),
    inTrainingGrounds: Boolean(quest.view_state?.includes('trainingGrounds')),
    hasDroid: Boolean(chargeLevel),
    battery: getBatteryNumber(chargeLevel),
    batteryPercent: Math.floor(batteries[chargeLevel]?.percent || 0),
    highestUnlockedBattery: Math.max(0, ...unlockedBatteries.map((battery) => getBatteryNumber(battery))),
    droidEnerchi: quest.droid?.remaining_energy || 0,
    enerchi: quest.items?.combat_energy_stat_item?.quantity || 0,
  };
};

/**
 * Get the Furoma Rift stage.
 *
 * @param {Object} context The stager context.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const state = getFuromaRiftState(context);

  let live = null;
  if (state.inTrainingGrounds) {
    live = 'Outside';
  } else if (state.inPagoda && state.battery > 0) {
    live = `Battery ${state.battery}`;
  }

  return { data: state.hasDroid ? 'Pagoda' : 'Training Grounds', live };
};

export { getFuromaRiftState };
