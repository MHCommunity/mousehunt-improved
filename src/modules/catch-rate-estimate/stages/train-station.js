/**
 * Get the Gnawnian Express Station stage.
 *
 * @param {Object} context         The stager context.
 * @param {Object} context.quests  The user's quests.
 * @param {string} context.charm   The charm name.
 * @param {number} context.charmId The charm ID.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests, charm, charmId }) => {
  const troubleAreaCharms = {
    door: 1210,
    rails: 1211,
    roof: 1212,
  };

  const fuelers = {
    'Magmatic Crystal Charm': 'Magmatic Crystal',
    'Black Powder Charm': 'Black Powder',
    'Dusty Coal Charm': 'Dusty Coal',
  };

  const quest = quests.QuestTrainStation;
  if (!quest.on_train) {
    return { data: 'Waiting', live: 'Station' };
  }

  if ('supplies' === quest.current_phase) {
    const isRush = quest.minigame?.supply_hoarder_turns > 0;
    let live = `1. Supply Depot - ${isRush ? 'Rush' : 'No Rush'}`;
    if (!isRush && 'Supply Schedule Charm' === charm) {
      live += ' + SS Charm';
    }

    return { data: `Supply Depot (${isRush ? 'Supply Rush' : 'No Supply Rush'})`, live };
  }

  if ('boarding' === quest.current_phase) {
    let defending = 'Not Defending';
    if (troubleAreaCharms[quest.minigame?.trouble_area] === charmId) {
      defending = 'Defending Target';
    } else if (Object.values(troubleAreaCharms).includes(charmId)) {
      defending = 'Defending Other';
    }

    return { data: 'Raider River', live: `2. Raider River - ${defending}` };
  }

  if ('bridge_jump' === quest.current_phase) {
    return { data: 'Daredevil Canyon', live: `3. Daredevil Canyon - ${fuelers[charm] ?? 'No Fuelers'}` };
  }

  return { data: null, live: null };
};
