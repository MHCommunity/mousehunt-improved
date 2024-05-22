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
  }
};

/**
 * Run the ToC simulation!
 * @param {EncySimOptions} options Simulator options.
 * @return {EncySimResults} Results of the simulation.
 */
const simulate = (options) => {
  updateWords(options.Upgrades);
  updateCR(options.TrapPower, options.TrapLuck);

  /** @type {Object<number, number>} */
  const volumeCountByVolume = {};
  for (let i = 0; i < options.TotalSimulations; i++) {
    let wordCount = options.WritingSession.WordsWritten;
    let huntsRemaining = options.WritingSession.HuntsRemaining;

    while (huntsRemaining > 0) {
      const stage = wordCount < 4000 ? 'PreEncyclopedia' : 'Encyclopedia';
      const mouse = getEncounteredMouse(stage);
      const mouseStats = MouseStats[mouse];

      const catchRoll = Math.random();
      if (catchRoll <= mouseStats.CatchRate) {
        wordCount += mouseStats.Words * (options.WritingSession.FuelEnabled ? 2 : 1);

        if (mouse === 'Mythweaver') {
          huntsRemaining += 2;
        }
      }

      huntsRemaining -= 1;
    }

    const totalVolumes = Math.floor(wordCount / 4000);
    if (! volumeCountByVolume[totalVolumes]) {
      volumeCountByVolume[totalVolumes] = 0;
    }

    volumeCountByVolume[totalVolumes] += 1;
  }

  const volumesWritten = Object.keys(volumeCountByVolume).map(Number);
  // javascript is maximum dumb
  volumesWritten.sort((a, b) => a - b);

  const minVolume = volumesWritten.at(0);
  const maxVolume = volumesWritten.at(-1);
  /** @type {EncySimResults} */
  const results = {
    chances: [],
    mean: {},
  };

  let cumulativeChance = 1;
  let mean = 0;

  for (let volume = minVolume; volume <= maxVolume; volume++) {
    if (! volumeCountByVolume[volume]) {
      continue;
    }

    const chance = volumeCountByVolume[volume] / options.TotalSimulations;
    cumulativeChance -= chance;

    mean += (volume * chance);

    // if (cumulativeChance >= 0.99) {
    //   results.beyondUnlucky = {
    //     volume: volume,
    //     gnawbels: volume * 54,
    //     words: volume * 4000,
    //   };
    // } else if (cumulativeChance >= 0.75) {
    //   results.unlucky = {
    //     volume: volume,
    //     gnawbels: volume * 54,
    //     words: volume * 4000,
    //   };
    // } else if (cumulativeChance >= 0.5) {
    //   results.median = {
    //     volume: volume,
    //     gnawbels: volume * 54,
    //     words: volume * 4000,
    //   };
    // } else if (cumulativeChance >= 0.25) {
    //   results.lucky = {
    //     volume: volume,
    //     gnawbels: volume * 54,
    //     words: volume * 4000,
    //   };
    // } else if (cumulativeChance >= 0.02) {
    //   results.beyondLucky = {
    //     volume: volume,
    //     gnawbels: volume * 54,
    //     words: volume * 4000,
    //   };
    // }

    results.chances.push({
      volume,
      gnawbels: volume * 54,
      words: volume * 4000,
      chance,
      cumulativeChance,
    });
  }

  mean = Math.round(mean * 100) / 100;
  results.mean = {
    volume: mean,
    gnawbels: mean * 54,
    words: mean * 4000,
  };

  return results;
};

const updateWords = (/** @type {Upgrades} */ upgrades) => {
  Object.entries(MouseStats).forEach(([key, mouseStats]) => {
    let words = mouseStats.Points / 1000;

    if (upgrades.HasSilverQuill) {
      words = Math.ceil(words * 1.25);
    }

    if (upgrades.HasGoldenQuill) {
      words = Math.ceil(words * 1.5);
    }

    MouseStats[key].Words = words;
  });
};

const updateCR = (/** @type {number} */ power, /** @type {number} */ luck) => {
  Object.entries(MouseStats).forEach(([key, mouseStats]) => {
    MouseStats[key].CatchRate = getCatchRate(mouseStats.Power, mouseStats.Eff, power, luck);
  });
};

const getCatchRate = (mousePower, effectiveness, power, luck) => {
  const rate = Math.min(1,
    ((effectiveness * power) + (
      2 * Math.pow(Math.floor(Math.min(effectiveness, 1.4) * luck), 2)
    )) / ((effectiveness * power) + mousePower)
  );

  return rate;
};

const getEncounteredMouse = (stage) => {
  let totalWeight = 0;
  let selected = '';
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
 */

/**
 * @typedef {Object} WritingSession
 * @property {number}  HuntsRemaining Number of hunts left in session.
 * @property {number}  WordsWritten   Number of words written in session.
 * @property {boolean} FuelEnabled    User has CC enabled.
 */

/**
 * @typedef {Object} EncySimOptions
 * @property {number}         TotalSimulations The amount of ToC runs to simulate.
 * @property {number}         TrapPower        Total trap power.
 * @property {number}         TrapLuck         Total trap luck.
 * @property {WritingSession} WritingSession   Current writing session.
 * @property {Upgrades}       Upgrades         User ToC upgrades.
 */

/**
 * @typedef {Object} EncySimResult
 * @property {number} volume   Expected result volume.
 * @property {number} gnawbels Expected GPLs for given volume.
 */

/**
 * @typedef {Object} EncySimResults
 * @property {EncySimResult} mean    The mean result from simulations.
 * @property {EncySimResult} unlucky The lower quartile result from median.
 * @property {EncySimResult} median  The average result.
 * @property {EncySimResult} lucky   The upper quartile result from median.
 */
