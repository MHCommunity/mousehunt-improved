/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestRiftFuroma) {
    return '';
  }

  const q = quests.QuestRiftFuroma;

  const map = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  const location = q.view_state.includes('pagoda') ? 'inside' : 'outside';

  if ('inside' === location) {
    const droidLevel = map[q.droid.charge_level.split('_')[2]];
    const batteryPercent = Math.floor(q.batteries[q.droid.charge_level].percent);

    return `Pagoda · Battery ${droidLevel} (${batteryPercent}%) · ${q.droid.remaining_energy} Enerchi`;
  }

  // find the highest battery that has unlocked in its status
  const unlockedBatteries = Object.keys(q.batteries).filter((battery) => {
    return q.batteries[battery].status.includes('unlocked');
  });

  // Get the highest battery.
  const highestBattery = unlockedBatteries.reduce((highest, battery) => {
    const batteryLevel = map[battery.split('_')[2]];
    return batteryLevel > highest ? batteryLevel : highest;
  }, 0);

  // Outside.
  return `Outside · Battery ${highestBattery} · ${q.items.combat_energy_stat_item.quantity} Enerchi`;
};
