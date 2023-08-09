// This is all borrowed from the original sim script while it's being rewritten.
/* eslint-disable */
// Sets the display for the percentages
// Set to true or false depending on which display you want
const cumulativeDisplay = true;
const exactDisplay = false;
const useUConEclipse = false;

const cacheLoot =
  [[0, 0],
    [7, 0],
    [16, 0],
    [24, 0],
    [32, 0],
    [40, 0],
    [48, 0],
    [50, 0],
    [59, 8],
    [69, 10],
    [80, 11],
    [88, 13],
    [98, 14],
    [107, 16],
    [118, 17],
    [120, 17],
    [135, 20],
    [150, 22],
    [165, 24],
    [182, 26],
    [199, 28],
    [217, 31],
    [235, 33],
    [254, 33],
    [272, 37],
    [290, 40],
    [308, 43],
    [325, 45],
    [342, 48],
    [357, 51],
    [372, 54],
    [386, 54],
    [399, 60],
    [410, 63],
    [421, 66],
    [430, 70],
    [439, 73],
    [446, 77],
    [453, 80],
    [459, 80],
    [464, 88],
    [469, 92],
    [473, 96],
    [477, 101],
    [480, 105],
    [482, 109],
    [485, 113],
    [487, 113],
    [489, 123],
    [490, 128],
    [492, 133],
    [493, 138],
    [494, 143],
    [495, 148],
    [495, 153],
    [496, 153],
    [497, 161],
    [497, 167],
    [497, 173],
    [498, 178],
    [498, 184],
    [498, 190],
    [499, 196],
    [500, 196],
    [500, 205],
    [500, 212],
    [500, 218],
    [500, 224],
    [500, 231],
    [500, 237],
    [500, 244],
    [500, 244],
    [500, 253],
    [500, 260],
    [500, 267],
    [500, 274],
    [500, 282],
    [500, 289],
    [500, 296],
    [500, 300]];

const normalAR = [[0.00000, 0.00000, 0.00000, 0.00000],
  [0.00000, 0.00000, 0.00000, 0.00000],
  [0.08246, 0.05616, 0.04866, 0.04231],
  [0.08246, 0.05616, 0.04866, 0.04231],
  [0.08246, 0.05616, 0.04866, 0.04231],
  [0.08246, 0.05616, 0.04866, 0.04231],
  [0.08246, 0.05616, 0.04866, 0.04231],
  [0.08246, 0.05616, 0.04866, 0.04231],
  [0.08246, 0.05616, 0.04866, 0.04231],
  [0.00000, 0.00000, 0.00000, 0.00000],
  [0.00000, 0.01658, 0.02836, 0.04121],
  [0.00000, 0.01658, 0.02836, 0.04121],
  [0.00000, 0.01658, 0.02836, 0.04121],
  [0.00000, 0.01658, 0.02836, 0.04121],
  [0.00000, 0.01658, 0.02836, 0.04121],
  [0.00000, 0.01658, 0.02836, 0.04121],
  [0.00000, 0.01658, 0.02836, 0.04121],
  [0.00000, 0.00000, 0.00000, 0.00000],
  [0.17073, 0.06332, 0.06193, 0.08571],
  [0.04065, 0.01583, 0.02368, 0.01978],
  [0.03252, 0.01583, 0.02732, 0.01209],
  [0.00000, 0.29288, 0.11840, 0.03626],
  [0.00000, 0.00000, 0.12750, 0.07473],
  [0.00000, 0.00000, 0.00000, 0.09725],
  [0.17886, 0.10290, 0.10200, 0.08956],
  [0.00000, 0.00000, 0.00000, 0.00000],
  [0.00000, 0.00000, 0.00000, 0.00000]];

const umbraAR = [[0.00000, 0.00000, 0.00000, 0.00000],
  [0.00000, 0.00000, 0.00000, 0.00000],
  [0.06600, 0.04129, 0.03857, 0.03100],
  [0.06600, 0.04129, 0.03857, 0.03100],
  [0.06600, 0.04129, 0.03857, 0.03100],
  [0.06600, 0.04129, 0.03857, 0.03100],
  [0.06600, 0.04129, 0.03857, 0.03100],
  [0.06600, 0.04129, 0.03857, 0.03100],
  [0.06600, 0.04129, 0.03857, 0.03100],
  [0.00000, 0.00000, 0.00000, 0.00000],
  [0.00000, 0.01043, 0.01886, 0.03600],
  [0.00000, 0.01043, 0.01886, 0.03600],
  [0.00000, 0.01043, 0.01886, 0.03600],
  [0.00000, 0.01043, 0.01886, 0.03600],
  [0.00000, 0.01043, 0.01886, 0.03600],
  [0.00000, 0.01043, 0.01886, 0.03600],
  [0.00000, 0.01043, 0.01886, 0.03600],
  [0.00000, 0.00000, 0.00000, 0.00000],
  [0.11500, 0.07200, 0.06500, 0.05600],
  [0.03800, 0.02300, 0.02000, 0.01700],
  [0.02300, 0.01400, 0.01300, 0.00900],
  [0.00000, 0.23110, 0.10806, 0.03300],
  [0.00000, 0.00000, 0.09800, 0.05500],
  [0.00000, 0.00000, 0.00000, 0.08100],
  [0.18300, 0.11200, 0.10200, 0.08000],
  [0.17900, 0.18600, 0.19200, 0.20000],
  [0.00000, 0.00000, 0.00000, 0.00000]];

const mouseDrops = [[0.00000, 0.00000, 0.00000, 0.00000, 1982],
  [0.00000, 0.00000, 0.00000, 0.00000, 4250],
  [0.60515, 0.60515, 0.00000, 0.00000, 1000],
  [0.63774, 0.63774, 0.00000, 0.00000, 1250],
  [0.56444, 0.56444, 0.00000, 0.00000, 1500],
  [0.57674, 0.57674, 0.00000, 0.00000, 2000],
  [0.63102, 0.63102, 0.00000, 0.00000, 2500],
  [0.57209, 0.57209, 0.00000, 0.00000, 3000],
  [0.59000, 0.59000, 0.00000, 0.00000, 4000],
  [2.40541, 0.98649, 0.00000, 0.00000, 25000],
  [0.01000, 0.01000, 1.10000, 1.00000, 6000],
  [0.00000, 0.00000, 1.10000, 1.00000, 6000],
  [0.00909, 0.00909, 1.10000, 1.00000, 6000],
  [0.00000, 0.00000, 1.10000, 1.00000, 6000],
  [0.00800, 0.00800, 1.10000, 1.00000, 6000],
  [0.00826, 0.00826, 1.10000, 1.00000, 6000],
  [0.03150, 0.03150, 1.10000, 1.00000, 6000],
  [3.82927, 1.00000, 0.00000, 0.00000, 100000],
  [0.01770, 0.01770, 0.00000, 0.00000, 2000],
  [0.00000, 0.00000, 0.00000, 0.00000, 1500],
  [0.01429, 0.01429, 0.00000, 0.00000, 1000],
  [0.00643, 0.00643, 1.10000, 1.00000, 5000],
  [0.00000, 0.00000, 1.15000, 1.00000, 5000],
  [0.02475, 0.02475, 1.75000, 1.00000, 8000],
  [0.99597, 0.99396, 0.00000, 0.00000, 4795],
  [0.00000, 0.00000, 0.00000, 0.00000, 12000],
  [0.00000, 0.00000, 0.00000, 0.00000, 0]];

const mouseStats = [[3300, 1],
  [5050, 1],
  [2900, 1],
  [6650, 2],
  [8800, 3],
  [11750, 4],
  [16000, 5],
  [21500, 6],
  [29000, 7],
  [7000000, 1000],
  [72000, 9],
  [72000, 9],
  [72000, 9],
  [72000, 9],
  [72000, 9],
  [72000, 9],
  [72000, 9],
  [13500000, 1000],
  [4800, 1.75],
  [8250, 1.75],
  [23000, 1.75],
  [38000, 10],
  [150000, 25],
  [350000, 50],
  [100, 2],
  [818250, 75],
  [1e30, 1]];

function getCacheLoot(floor) {
  let idx = floor > 1 ? (floor - 1) : 0;
  if (idx >= cacheLoot.length) {
    idx = cacheLoot.length - 1;
  }
  const loot = cacheLoot[idx];
  return loot;
}

function convertToCR(power, luck, stats) {
  const mPower = stats[0];
  const mEff = stats[1];
  return Math.min(1, (power * mEff + 2 * Math.pow(luck * Math.min(mEff, 1.4), 2)) / (mPower + power * mEff));
}

function simulate(shouldDisplay = true) {
  const time = (new Date()).getTime() / 1000;

  const lvSpeed = window.user.enviroment_atts.power_up_data.long_stride.current_value;
  const lvSync = window.user.enviroment_atts.power_up_data.hunt_limit.current_level + 1;
  const lvSiphon = window.user.enviroment_atts.power_up_data.boss_extension.current_level + 1;
  let siphon = window.user.enviroment_atts.power_up_data.boss_extension.current_value;
  const sync = window.user.enviroment_atts.hunts_remaining;
  const steps = window.user.enviroment_atts.current_step;
  const torchState = window.user.enviroment_atts.is_fuel_enabled;
  const torchEclipse = true;
  const umbra = window.user.enviroment_atts.active_augmentations.tu;
  const superSiphon = window.user.enviroment_atts.active_augmentations.ss;
  const strStep = window.user.enviroment_atts.active_augmentations.sste;
  const curFloor = window.user.enviroment_atts.floor;
  const sh = window.user.enviroment_atts.active_augmentations.hr;
  const sr = window.user.enviroment_atts.active_augmentations.sr;
  const bail = 999; // this is only here so I don't have to maintain two versions of this code :^)

  let power = window.user.trap_power;
  let luck = (window.user.trinket_name == 'Ultimate Charm') ? 100000 : window.user.trap_luck;

  try {
    const altpower = Number(document.getElementsByClassName('campPage-trap-trapStat power')[0].children[1].innerText.match(/[0-9]/g).join(''));
    const altluck = Number(document.getElementsByClassName('campPage-trap-trapStat luck')[0].children[1].innerText);
    power = Number.isNaN(altpower) ? power : Math.max(power, altpower);
    luck = Number.isNaN(altluck) ? luck : Math.max(luck, altluck);
  } catch (err) {
    console.log(err);
  }

  const mouseCR = mouseStats.map(function (stats) {
    return convertToCR(power, luck, stats);
  });
  if (useUConEclipse) {
    mouseCR[9] = 1;
    mouseCR[17] = 1;
  }

  const mouseAR = umbra ? umbraAR : normalAR;
  const eclipseCR = umbra ? mouseCR[17] : mouseCR[9];
  const eclipseSG = umbra ? mouseDrops[17][0] : mouseDrops[9][0];
  const eclipseSC = umbra ? mouseDrops[17][2] : mouseDrops[9][2];
  const eclipseGold = umbra ? mouseDrops[17][4] : mouseDrops[9][4];
  const catchProfile = {
    push: [eclipseCR],
    ta: [0],
    kb: [1 - eclipseCR],
    bkb: [0],
    fta: [0],
    sg: [eclipseSG * eclipseCR],
    sgi: [0],
    sc: [eclipseSC * eclipseCR],
    sci: [0],
    gold: [eclipseGold * eclipseCR],
    cf: [0]
  };

  for (var j = 1; j <= 4; j++) {
    catchProfile.ta[j] = mouseCR[24] * mouseAR[24][j - 1];
    catchProfile.bkb[j] = (1 - mouseCR[25]) * mouseAR[25][j - 1];
    catchProfile.fta[j] = 0;
    catchProfile.sg[j] = 0;
    catchProfile.sgi[j] = 0;
    catchProfile.sc[j] = 0;
    catchProfile.sci[j] = 0;
    catchProfile.gold[j] = 0;
    catchProfile.cf[j] = 0;
    catchProfile.push[j] = -catchProfile.ta[j];
    mouseCR.map(function (cr, index) {
      catchProfile.push[j] += cr * mouseAR[index][j - 1];
      catchProfile.sg[j] += cr * mouseAR[index][j - 1] * mouseDrops[index][0];
      catchProfile.sgi[j] += cr * mouseAR[index][j - 1] * mouseDrops[index][1];
      catchProfile.sc[j] += cr * mouseAR[index][j - 1] * mouseDrops[index][2];
      catchProfile.sci[j] += cr * mouseAR[index][j - 1] * mouseDrops[index][3];
      catchProfile.gold[j] += cr * mouseAR[index][j - 1] * mouseDrops[index][4];
    });
    catchProfile.kb[j] = 1 - catchProfile.ta[j] - catchProfile.bkb[j] - catchProfile.push[j];
  }
  console.log(catchProfile);

  const speed = torchState ? Number(lvSpeed) + 1 : lvSpeed;
  siphon = superSiphon ? siphon * 2 : siphon;

  // Simulating Run ------------------------------------------------------------------------

  let sigils = 0;
  let secrets = 0;
  let gold = 0;
  let cfDrops = 0;
  let totalHunts = 0;
  let catches = 0;

  function addRate(step, hunts, change) {
    if (runValues[step] == null) {
      runValues[step] = [];
    }
    if (runValues[step][hunts] == null) {
      runValues[step][hunts] = 0;
    }
    runValues[step][hunts] += change;
  }

  function stepBuild(step) {
    stepDetails[step] = {};
    let lap = Math.floor(Math.pow(step / 35 + 2809 / 1225, 0.5) - 53 / 35) + 1;
    const checkLap = Math.floor(Math.pow((step + 1) / 35 + 2809 / 1225, 0.5) - 53 / 35) + 1;
    const toEC = checkLap * (106 + 35 * (checkLap)) - 1;
    const floorLength = 10 * (lap + 1);
    const onEC = lap * (106 + 35 * (lap)) - 1;
    const flFromEC = Math.ceil((onEC - step) / floorLength);
    const floorStart = onEC - flFromEC * floorLength;
    stepDetails[step].floor = lap * 8 - flFromEC;
    stepDetails[step].sync = siphon * (lap - 1) - syncSpent;
    stepDetails[step].toPush = (flFromEC == 0) ? Math.min(step + speed - torchState + torchEclipse, toEC) : Math.min(step + speed, toEC);
    stepDetails[step].toTA = strStep ? Math.min(step + 4 * speed, toEC) : Math.min(step + 2 * speed, toEC); // normal TA
    stepDetails[step].toKB = umbra === true ? Math.max(step - 5, floorStart) : Math.max(step, floorStart); // normal run FTC
    stepDetails[step].toBKB = Math.max(step - 10, floorStart); // bulwarked
    lap = (flFromEC == 0) ? 0 : Math.min(lap, 4);
    stepDetails[step].cPush = catchProfile.push[lap];
    stepDetails[step].cTA = catchProfile.ta[lap];
    stepDetails[step].cKB = catchProfile.kb[lap];
    stepDetails[step].cBKB = catchProfile.bkb[lap];
    stepDetails[step].cFTA = catchProfile.fta[lap];
    stepDetails[step].sg = catchProfile.sg[lap];
    stepDetails[step].sgi = catchProfile.sgi[lap];
    stepDetails[step].sc = catchProfile.sc[lap];
    stepDetails[step].sci = catchProfile.sci[lap];
    stepDetails[step].gold = catchProfile.gold[lap];
    stepDetails[step].cf = catchProfile.cf[lap];
  }

  var syncSpent = 0;
  const valuesDistribution = Array(500);
  for (var i = 0; i < 500; i++) {
    valuesDistribution[i] = [];
  }
  var stepDetails = [];
  let loopActive = 1;
  let startActive = steps;
  let endActive = steps;
  let loopEnd;

  for (let k = 0; k < valuesDistribution.length; k++) {
    valuesDistribution[k][0] = 0;
  }
  var runValues = [];
  for (var step = 0; step < steps; step++) {
    runValues[step] = [];
    runValues[step][0] = 0;
  }
  runValues[steps] = [1];

  stepBuild(steps);
  syncSpent = stepDetails[steps].sync - sync;
  stepBuild(steps);

  // runDetails[step][detail] = value
  // detail: lap (0), toEC (1), fltoEC (2)
  // runValues[step][hunts] = probability

  for (let hunts = 1; loopActive == 1; hunts++) {
    loopActive = 0;
    loopEnd = endActive;
    for (step = startActive; step <= loopEnd; step++) {
      if (runValues[step] == null) {
        runValues[step] = [];
      } else {
        const rate = runValues[step][hunts - 1];
        if (rate != null && rate > 1e-8) {
          if (stepDetails[step] == null) {
            stepBuild(step);
          }
          gold += rate * stepDetails[step].gold;
          cfDrops += rate * stepDetails[step].cf;
          sigils += rate * stepDetails[step].sg;
          secrets += rate * stepDetails[step].sc;
          if ((torchState && (stepDetails[step].floor % 8 != 0)) || (torchEclipse && (stepDetails[step].floor % 8 == 0))) {
            sigils += rate * stepDetails[step].sgi;
            secrets += rate * stepDetails[step].sci;
          }
          if (hunts <= stepDetails[step].sync && rate != 0 && stepDetails[step].floor < bail) {
            loopActive = 1;
            startActive = Math.min(startActive, stepDetails[step].toBKB);
            endActive = Math.max(endActive, stepDetails[step].toTA);
            addRate(stepDetails[step].toPush, hunts, rate * stepDetails[step].cPush);
            addRate(stepDetails[step].toTA, hunts, rate * stepDetails[step].cTA);
            addRate(stepDetails[step].toKB, hunts, rate * stepDetails[step].cKB);
            addRate(stepDetails[step].toBKB, hunts, rate * stepDetails[step].cBKB);
            addRate(step, hunts, rate * stepDetails[step].cFTA); // FTA
            catches += rate * (stepDetails[step].cPush + stepDetails[step].cTA);
          } else if (hunts - 1 == stepDetails[step].sync || stepDetails[step].floor >= bail) {
            totalHunts += (hunts - 1) * rate;
            valuesDistribution[stepDetails[step].floor - 1][0] += rate;
          }
        }
      }
    }
  }

  // Results Display ------------------------------------------------------------------------

  let averageFloor = 0;
  valuesDistribution.map(function (a, b) {
    averageFloor += a * (b + 1);
  });

  const loopDistribution = Array(25).fill(0).map(
    function (a, index) {
      let sum = 0;
      valuesDistribution.slice(index * 8, (index + 1) * 8).map(
        function (a) {
          sum += Number(a);
        }
      );
      return Number(sum);
    }
  );

  let runningProbability = 1;
  const loopCumulative = loopDistribution.map(function (a) {
    const result = runningProbability;
    runningProbability -= a;
    return result;
  });
  const loopCopy = loopDistribution.slice(0).filter(function (a) {
    return a > 0.001;
  });

  const avgFloor = Math.round(averageFloor);
  const curCache = getCacheLoot(curFloor);
  const avgCache = getCacheLoot(avgFloor);
  const mult = [sh ? 1.5 : 1.0, sr ? 1.5 : 1.0];
  const deltaCache = [Math.ceil(avgCache[0] * mult[0]) - Math.ceil(curCache[0] * mult[0]), Math.ceil(avgCache[1] * mult[1]) - Math.ceil(curCache[1] * mult[1])];

  const display = [
    'VRift Sim: ' + lvSpeed + '/' + lvSync + '/' + lvSiphon + (torchState ? ' CF' : '') + (superSiphon ? ' SS' : '') + (umbra ? ' UU' : '') + (strStep ? ' SSt' : '') + (useUConEclipse ? ' (UC Eclipse)' : ''),
    'Steps: ' + steps + '    Sync: ' + sync,
    'Power: ' + power + '    Luck: ' + luck,
    'Average Highest Floor: ' + avgFloor + ',    Average Hunts: ' + Math.round(totalHunts),
    '| Loot:  Sigils: +' + Math.round(sigils) + ',    Secrets: +' + Math.round(secrets),
    '| Cache: Sigils: +' + deltaCache[0] + ',    Secrets: +' + deltaCache[1],
    ''
  ];

  const startDisplay = display.length;
  const fullDisplay = ['VRift Run Simulation: ' + ((new Date()).getTime() / 1000 - time) + ' seconds taken.',
    'Speed: ' + lvSpeed,
    'Siphon: ' + siphon,
    (torchState ? 'CF ' : '') + (superSiphon ? 'SS ' : '') + (umbra ? 'UU ' : '') + (strStep ? 'SSt ' : ''),
    'Steps: ' + steps,
    'Sync: ' + sync,
    'Power: ' + power,
    'Luck: ' + luck,
    'Sigils: ' + sigils,
    'Secrets: ' + secrets,
    'Gold: ' + gold,
    'Average Highest Floor: ' + Math.round(averageFloor),
    'Average Hunts: ' + Math.round(totalHunts),
    ''];

  const startFullDisplay = fullDisplay.length;

  const eclipses = [];

  for (i = 0; i < loopCopy.length; i++) {
    const loopIndex = loopDistribution.indexOf(loopCopy[i]);

    const eEntry = (loopCopy[i] * 100).toFixed(1);
    const cEntry = (loopCumulative[loopIndex] * 100).toFixed(1);
    let entry = 'Eclipse #' + loopIndex.toString() + ': ';
    const fullEntry = entry + eEntry + '% (' + cEntry + '% cumulative)';
    if (exactDisplay && cumulativeDisplay) {
      entry = fullEntry;
    } else if (cumulativeDisplay) {
      entry += cEntry + '%';
    } else {
      entry += eEntry + '%';
    }

    display[startDisplay + i] = entry;
    fullDisplay[startFullDisplay + i] = fullEntry;

    // add entry to eclipses array
    eclipses.push({
      number: loopIndex,
      percent: eEntry,
      cumulative: cEntry
    });
  }

  if (shouldDisplay) {
    console.log(fullDisplay.join('\n'));
    alert(display.join('\n'));
  } else {
    return {
      speed: lvSpeed,
      sync: lvSync,
      siphon: lvSiphon,
      cfOn: torchState,
      superSiphon,
      umbra,
      strStep,
      ucEclipse: useUConEclipse,
      steps,
      power,
      luck,
      avgFloor,
      avgHunts: Math.round(totalHunts),
      lootSigils: Math.round(sigils),
      lootSecrets: Math.round(secrets),
      cacheSigils: deltaCache[0],
      cacheSecrets: deltaCache[0],
      eclipses,
    };
  }
}

const displayResults = (results) => {
  console.log(results);

  let eclipseText = '';
  results.eclipses.forEach((eclipse) => {
    eclipseText += `<li>
    <span class="number">Eclipse ${eclipse.number}</span>
    <span class="percent ${eclipse.percent === '100.0' ? 'guaranteed' : ''}">${eclipse.percent}%</span>
    <span class="cumulative ${eclipse.cumulative === '100.0' ? 'guaranteed' : ''}">${eclipse.cumulative}%</span>
    </li>`;
  });

  return `<div class="mh-vrift-sim-results">
    <div class="stats">
      <div class="result">
        <div class="label">Speed</div>
        <div class="value">${results.speed}</div>
      </div>
      <div class="result">
        <div class="label">Sync</div>
        <div class="value">${results.sync}</div>
      </div>
      <div class="result">
        <div class="label">Avg. Highest Floor</div>
        <div class="value">${results.avgFloor}</div>
      </div>
      <div class="result">
        <div class="label">Avg. Hunts</div>
        <div class="value">${results.avgHunts}</div>
      </div>
      <div class="result">
        <div class="label">Sigils (Loot)</div>
        <div class="value">${results.lootSigils}</div>
      </div>
      <div class="result">
        <div class="label">Secrets (Loot)</div>
        <div class="value">${results.lootSecrets}</div>
      </div>
      <div class="result">
        <div class="label">Sigils (Cache)</div>
        <div class="value">${results.cacheSigils}</div>
      </div>
      <div class="result">
        <div class="label">Secrets (Cache)</div>
        <div class="value">${results.cacheSecrets}</div>
      </div>
    </div>

    <div class="eclipses">
      <ol>
        <li class="header">
          <span class="number">#</span>
          <span class="percent">Chance</span>
          <span class="cumulative">Total</span>
        </li>
        ${eclipseText}
      </ol>
    </div>
  </div>`;
};

const main = () => {
  addUIComponents();

  const simPopup = document.querySelector('.valourRiftHUD-floorProgress-barContainer');
  if (simPopup) {
    simPopup.addEventListener('click', () => {
      const data = simulate(false);
      console.log(data);
      const popup = createPopup({
        title: 'Valour Rift Run Simulation',
        content: displayResults(data),
        show: false,
      });

      popup.setAttributes({ className: 'mh-vrift-popup' });
      popup.show();
    });
  }
};
/* eslint-enable */

const addUIComponents = () => {
  const existing = document.querySelector('#mh-vrift-floor-name');
  if (existing) {
    existing.remove();
  }

  const floor = document.querySelector('.valourRiftHUD-currentFloor');
  if (floor) {
    const floorName = makeElement('div', 'valourRiftHUD-floorName', user?.quests?.QuestRiftValour?.floor_name);
    floorName.id = 'mh-vrift-floor-name';
    floor.appendChild(floorName);
  }

  const floorTooltipParent = document.querySelector('.valourRiftHUD-floorProgress.mousehuntTooltipParent');
  if (! floorTooltipParent) {
    return;
  }

  const tooltip = floorTooltipParent.querySelector('.mousehuntTooltip');
  if (! tooltip) {
    return;
  }

  tooltip.classList.add('bottom', 'mh-vrift-floor-tooltip');
  tooltip.classList.remove('top');

  const stepsRemaining = tooltip.querySelector('.valourRiftHUD-stepsRemaining');
  if (! stepsRemaining) {
    return;
  }

  const floorBar = document.querySelector('.valourRiftHUD-floorProgress-barContainer');
  if (! floorBar) {
    return;
  }

  const stepsExisting = document.querySelector('.mh-vrift-steps-remaining');
  if (stepsExisting) {
    stepsExisting.remove();
  }

  makeElement('div', 'mh-vrift-steps-remaining', stepsRemaining.textContent, floorBar);
};

export default main;
