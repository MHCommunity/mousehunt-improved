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

  if (q.view_state.includes('pagoda')) {
    const droidLevel = map[q.droid.charge_level.split('_')[2]];
    const batteryPercent = Math.floor(q.batteries[q.droid.charge_level].percent);

    return `Pagoda, Battery ${droidLevel} (${batteryPercent}%), ${q.droid.remaining_energy} energy`;
  }

  // Outside.
  return 'Outside';
};
