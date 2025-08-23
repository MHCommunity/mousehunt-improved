import { debuglog } from '@utils';

// @ts-nocheck
const MousePool = {
  PreEncyclopedia: {
    Grammarian: 1,
  },
  Encyclopedia: {
    Grammarian: 0.6,
    Mythweaver: 0.4,
  }
};

/**
 * @type {Object<string, {Power: number, Eff: number, Points: number, Words?: number, CatchRate?: number}>}
 */
const MouseStats = {
  Grammarian: {
    Power: 90_000,
    Eff: 4,
    Points: 250_000,
  },
  Mythweaver: {
    Power: 200_000,
    Eff: 7,
    Points: 1_000_000,
  },
  M1000: {
    Power: 236_000,
    Eff: 4,
    Points: 1_066_000,
  }
};

/**
 * Run the ToC simulation!
 *
 * @param {EncySimOptions} options Simulator options.
 *
 * @return {EncySimResults} Results of the simulation.
 */
const simulate = (options) => {
  updateWords(options.Upgrades);
  updateCR(options.TrapPower, options.TrapLuck, options.TrapCharmId);

  const debug = {};

  /** @type {Object<number, number>} */
  const volumeCountByVolume = {};
  const processorsByVolume = {};
  for (let i = 0; i < options.TotalSimulations; i++) {
    let wordCount = options.WritingSession.WordsWritten;
    let huntsRemaining = options.WritingSession.HuntsRemaining;
    let processors = 0;

    while (huntsRemaining > 0) {
      const stage = wordCount < 4000 ? 'PreEncyclopedia' : 'Encyclopedia';
      const mouse = getEncounteredMouse(options, stage);
      const mouseStats = MouseStats[mouse];

      const catchRoll = Math.random();
      if (catchRoll <= mouseStats.CatchRate) {
        wordCount += mouseStats.Words * (options.WritingSession.FuelEnabled ? 2 : 1);
        processors += Math.floor(wordCount / 4000);

        if (mouse === 'Mythweaver') {
          huntsRemaining += 2;
        }
      }

      huntsRemaining -= 1;
    }

    const totalVolumes = Math.floor(wordCount / 4000);
    if (! volumeCountByVolume[totalVolumes]) {
      volumeCountByVolume[totalVolumes] = 0;
      processorsByVolume[totalVolumes] = 0;
    }

    volumeCountByVolume[totalVolumes] += 1;
    processorsByVolume[totalVolumes] += processors;

    if (! debug[totalVolumes]) {
      debug[totalVolumes] = [];
    }

    debug[totalVolumes].push({
      wordCount,
      totalVolumes,
    });
  }

  const volumesWritten = Object.keys(volumeCountByVolume).map(Number);
  // javascript is maximum dumb
  volumesWritten.sort((a, b) => a - b);

  const minVolume = volumesWritten.at(0);
  const maxVolume = volumesWritten.at(-1);
  /** @type {EncySimResults} */
  const results = {
    chances: [],
    mostLikely: {
      volume: 0,
      gnawbels: 0,
      words: 0,
      processors: 0
    },
  };

  let cumulativeChance = 1;

  for (let volume = minVolume; volume <= maxVolume; volume++) {
    if (! volumeCountByVolume[volume]) {
      continue;
    }

    const chance = volumeCountByVolume[volume] / options.TotalSimulations;
    const processors = Math.floor(processorsByVolume[volume] / volumeCountByVolume[volume]);
    cumulativeChance -= chance;

    results.chances.push({
      volume,
      gnawbels: volume * 54,
      words: volume * 4000,
      processors,
      chance,
      cumulativeChance,
    });
  }

  const mostLikelyVolume = Number(Object.keys(volumeCountByVolume).reduce((a, b) => volumeCountByVolume[a] > volumeCountByVolume[b] ? a : b));

  results.mostLikely = {
    volume: mostLikelyVolume,
    gnawbels: mostLikelyVolume * 54,
    words: mostLikelyVolume * 4000,
    processors: Math.floor(processorsByVolume[mostLikelyVolume] / volumeCountByVolume[mostLikelyVolume]),
  };

  debuglog('location-huds-table-of-contents', `Simulated ${options.TotalSimulations} ToC runs.`, results);

  return results;
};

/**
 * Update the words written by the user.
 *
 * @param {Upgrades} upgrades User upgrades.
 */
const updateWords = (/** @type {Upgrades} */ upgrades) => {
  Object.entries(MouseStats).forEach(([key, mouseStats]) => {
    let words = mouseStats.Points / 1000;

    if (upgrades.HasSilverQuill) {
      words = Math.ceil(words * 1.25);
    }

    if (upgrades.HasGoldenQuill) {
      words = Math.ceil(words * 1.5);
    }

    if (upgrades.HasRainbowQuill) {
      words = Math.ceil(words * 1.75);
    }

    MouseStats[key].Words = words;
  });
};

/**
 * Update the catch rate of the mice.
 *
 * @param {number} power   Total trap power.
 * @param {number} luck    Total trap luck.
 * @param {number} charmId Current trap charm ID.
 */
const updateCR = (power, luck, charmId) => {
  Object.entries(MouseStats).forEach(([key, mouseStats]) => {
    // 1075: Ultimate Charm
    MouseStats[key].CatchRate = 1075 === charmId
      ? 1
      : getCatchRate(mouseStats.Power, mouseStats.Eff, power, luck);
  });
};

/**
 * Get the catch rate of the mouse.
 *
 * @param {number} mousePower    The power of the mouse.
 * @param {number} effectiveness The effectiveness of the trap.
 * @param {number} power         The power of the trap.
 * @param {number} luck          The luck of the trap.
 *
 * @return {number} The catch rate.
 */
const getCatchRate = (mousePower, effectiveness, power, luck) => {
  const rate = Math.min(1,
    ((effectiveness * power) + (
      2 * Math.pow(Math.floor(Math.min(effectiveness, 1.4) * luck), 2)
    )) / ((effectiveness * power) + mousePower)
  );

  return rate;
};

/**
 * Get the encountered mouse.
 * @param {EncySimOptions} options The simulation options.
 * @param {string}         stage   The stage of the simulation.
 *
 * @return {string} The encountered mouse.
 */
const getEncounteredMouse = (options, stage) => {
  let totalWeight = 0;
  let selected = '';

  if (options.WritingSession.M1KMode) {
    return 'M1000';
  }

  for (const [mouse, weight] of Object.entries(MousePool[stage])) {
    const r = Math.random();
    if (r >= totalWeight) {
      selected = mouse;
    }
    totalWeight += weight;
  }

  return selected;
};

export default simulate;

/**
 * @typedef {Object} Upgrades
 * @property {boolean} HasGoldFoilPrinting User has Gold Foil Printing upgrade.
 * @property {boolean} HasEdgeGilding      User has Edge Gilding upgrade.
 * @property {boolean} HasSilverQuill      User has Silver Quill upgrade.
 * @property {boolean} HasGoldenQuill      User has Golden Quill upgrade.
 * @property {boolean} HasRainbowQuill     User has Rainbow Quill upgrade.
 */

/**
 * @typedef {Object} WritingSession
 * @property {number}  HuntsRemaining Number of hunts left in session.
 * @property {number}  WordsWritten   Number of words written in session.
 * @property {boolean} M1KMode        The bait used in the session.
 * @property {boolean} FuelEnabled    User has CC enabled.
 */

/**
 * @typedef {Object} EncySimOptions
 * @property {number}         TotalSimulations The amount of ToC runs to simulate.
 * @property {number}         TrapPower        Total trap power.
 * @property {number}         TrapLuck         Total trap luck.
 * @property {number}         TrapCharmId      Current trap charm ID.
 * @property {WritingSession} WritingSession   Current writing session.
 * @property {Upgrades}       Upgrades         User ToC upgrades.
 */

/**
 * @typedef {Object} EncySimResult
 * @property {number} volume     Expected result volume.
 * @property {number} gnawbels   Expected GPLs for given volume.
 * @property {number} words      Expected words for given volume.
 * @property {number} processors Expected processors for given run.
 */

/**
 * @typedef {Object} EncySimResults
 * @property {(EncySimResult & {
 * chance: number,
 * cumulativeChance: number,
 * })[]}                               chances    The chances of each volume.
 * @property {EncySimResult}           mostLikely The upper quartile result from median.
 */
