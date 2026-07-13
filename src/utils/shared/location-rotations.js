/**
 * The locations that cycle through stages on a fixed, global schedule, repeating their stages
 * forever from `epoch`.
 *
 * Lengths are in minutes, not fractional hours — a rounded hourly length drifts by minutes
 * over the years since the epoch.
 *
 * Props Warden Slayer & Timers+ for the epochs.
 */
const rotations = {
  forbidden_grove: {
    name: 'Forbidden Grove',
    // The app's ForbiddenGroveView: open for the first 960 minutes of every 1200. This epoch
    // is the moment the Grove opens.
    epoch: 1285704000,
    stages: [
      { name: 'Open', length: 16 * 60 },
      { name: 'Closed', length: 4 * 60 },
    ],
  },
  balacks_cove: {
    name: 'Balack\'s Cove',
    // The app's BalacksCoveView: the tide rises through one 560 minute half cycle and falls
    // back through the next, so a rotation is 1120 minutes. This epoch is the first minute of
    // a low tide. The app says 'Medium Tide', but the web HUD this sits beside says 'Mid Tide'.
    epoch: 1294680060,
    stages: [
      { name: 'Low Tide', length: 16 * 60 },
      { name: 'Mid Tide', length: 60, note: 'coming in' },
      { name: 'High Tide', length: 40 },
      { name: 'Mid Tide', length: 60, note: 'going out' },
    ],
  },
  seasonal_garden: {
    name: 'Seasonal Garden',
    // The client never works this one out — the season comes from the server — so it's checked
    // against the travel page's `#seasonal-garden-seconds-left`, which on 2026-07-13 had Fall
    // changing to Winter at midnight UTC on the 16th, exactly where this puts it.
    epoch: 288000,
    stages: [
      { name: 'Summer', length: 80 * 60 },
      { name: 'Fall', length: 80 * 60 },
      { name: 'Winter', length: 80 * 60 },
      { name: 'Spring', length: 80 * 60 },
    ],
  },
  pollution_outbreak: {
    name: 'Toxic Spill',
    // Pollution rises to Archduke and falls back, so every title but the peak and the trough
    // happens twice a rotation. Lengths come from the HUD's title tooltips, and the width of
    // each title's block confirms Hero (9.93% of the 302 hours, ie. all 30) and Archduke are
    // single stages rather than a rising and a falling half.
    //
    // Timers+ starts 15 hours into Hero, splitting it across the wrap; starting 15 hours
    // earlier keeps Hero in one piece.
    epoch: 1503597600 - (15 * 3600),
    stages: [
      { name: 'Hero', length: 30 * 60 },
      { name: 'Knight', length: 16 * 60, note: 'rising' },
      { name: 'Lord/Lady', length: 18 * 60, note: 'rising' },
      { name: 'Baron/Baroness', length: 18 * 60, note: 'rising' },
      { name: 'Count/Countess', length: 24 * 60, note: 'rising' },
      { name: 'Duke/Duchess', length: 24 * 60, note: 'rising' },
      { name: 'Grand Duke/Duchess', length: 24 * 60, note: 'rising' },
      { name: 'Archduke/Archduchess', length: 24 * 60 },
      { name: 'Grand Duke/Duchess', length: 24 * 60, note: 'falling' },
      { name: 'Duke/Duchess', length: 24 * 60, note: 'falling' },
      { name: 'Count/Countess', length: 24 * 60, note: 'falling' },
      { name: 'Baron/Baroness', length: 18 * 60, note: 'falling' },
      { name: 'Lord/Lady', length: 18 * 60, note: 'falling' },
      { name: 'Knight', length: 16 * 60, note: 'falling' },
    ],
  },
};

/**
 * The rotating locations, in the order we show them.
 */
const rotationLocations = Object.keys(rotations);

/**
 * Get the stage a location is in now, and the next occurrence of each other stage, in the
 * order they happen.
 *
 * @param {string} location The location ID, eg. `balacks_cove`.
 *
 * @return {Object|boolean} The rotation state, or false if the location doesn't rotate.
 */
const getLocationRotation = (location) => {
  const rotation = rotations[location];
  if (! rotation) {
    return false;
  }

  const stages = rotation.stages;
  const rotationLength = stages.reduce((total, stage) => total + stage.length, 0);

  const elapsed = ((Date.now() / 1000) - rotation.epoch) / 60;
  const minutesIntoRotation = ((elapsed % rotationLength) + rotationLength) % rotationLength;

  // Walk the stages until we find the one we're currently in.
  let index = 0;
  let stageStart = 0;
  while (stageStart + stages[index].length <= minutesIntoRotation) {
    stageStart += stages[index].length;
    index += 1;
  }

  const current = stages[index];
  const minutesLeft = (stageStart + current.length) - minutesIntoRotation;

  // Walk the rest of the rotation, keeping the first time we come across each stage.
  const upcoming = [];
  const seen = new Set();
  let minutes = minutesLeft;

  for (let offset = 1; offset <= stages.length; offset += 1) {
    const stage = stages[(index + offset) % stages.length];

    if (! seen.has(stage.name)) {
      seen.add(stage.name);

      upcoming.push({
        ...stage,
        minutes,
        isSameLevel: stage.name === current.name,
        isRepeat: stage === current,
      });
    }

    minutes += stage.length;
  }

  return {
    id: location,
    name: rotation.name,
    current: { ...current, minutesLeft },
    upcoming,
  };
};

/**
 * Format a countdown.
 *
 * @param {number}  minutes       The number of minutes.
 * @param {boolean} [showSeconds] Whether to count down the seconds in the final minute.
 *
 * @return {string} The formatted countdown, eg. '3d 4h 5m', '4h 5m', or '5m 30s'.
 */
const formatRotationTime = (minutes, showSeconds = false) => {
  const totalSeconds = Math.max(0, Math.round(minutes * 60));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`;
  }

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  if (showSeconds) {
    return `${mins}m ${totalSeconds % 60}s`;
  }

  return `${Math.ceil(totalSeconds / 60)}m`;
};

export {
  formatRotationTime,
  getLocationRotation,
  rotationLocations
};
