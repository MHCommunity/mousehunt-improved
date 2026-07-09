import {
  dataGet,
  dataSet,
  debuglog,
  getUserSetupDetails,
  onEvent,
  onRequest,
  parseNumber,
  updateTrapStatsDisplay
} from '@utils';

const supportedBases = [
  {
    slug: 'valour_rift_prestige_base',
    name: 'Prestige Base',
    id: 2904,
  },
  {
    slug: 'hailstone_singularity_base',
    name: 'Rift Hailstone Singularity Base',
    id: 3954,
  },
];

const fixedBaseStatOverrides = [
  {
    selector: '.campPage-trap-itemBrowser-item.base.denture_base',
    stats: {
      power: 1500,
      powerBonus: 25,
      luck: 20,
      attractionBonus: 25
    }
  },
  {
    selector: '.campPage-trap-itemBrowser-item.base.upgraded_denture_base',
    stats: {
      power: 3750,
      powerBonus: 25,
      luck: 50,
      attractionBonus: 25
    }
  },
  {
    selector: '.campPage-trap-itemBrowser-item.base.folklore_printing_press_base',
    stats: {
      power: 4500,
      powerBonus: 35,
      luck: 57,
      attractionBonus: 35
    }
  },
  {
    selector: '.campPage-trap-itemBrowser-item.base.naughty_list_printing_press_base',
    stats: {
      power: 4500,
      powerBonus: 35,
      luck: 57,
      attractionBonus: 35
    }
  },
];

/**
 * Update the saved supported base stats display.
 */
const setSupportedBaseStats = async () => {
  const savedStats = await dataGet('pb-stats', false);
  if (! savedStats) {
    return;
  }

  supportedBases.forEach((base) => {
    const baseElement = document.querySelector(`.campPage-trap-itemBrowser-item.base.${base.slug}`);
    if (baseElement) {
      updateTrapStatsDisplay(baseElement, savedStats);
    }
  });

  const armed = document.querySelector('.campPage-trap-itemBrowser-armed-item.base');
  if (! armed) {
    return;
  }

  const name = armed.querySelector('.campPage-trap-itemBrowser-item-name');
  if (! name) {
    return;
  }

  const isSupportedBase = supportedBases.some((base) => name.innerText.includes(base.name));
  if (isSupportedBase) {
    updateTrapStatsDisplay(armed, savedStats);
  }
};

let isModifyingSupportedBases = false;

/**
 * Move supported bases into the recommended section and update their stats.
 *
 * @param {Object} opts The options object.
 */
const modifySupportedBases = async (opts = {}) => {
  if (isModifyingSupportedBases) {
    return;
  }

  isModifyingSupportedBases = true;

  const activeBp = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
  if (! activeBp) {
    isModifyingSupportedBases = false;
    return;
  }

  const bpType = activeBp.getAttribute('data-blueprint-type');
  if (! bpType || bpType !== 'base') {
    isModifyingSupportedBases = false;
    return;
  }

  const { retrySupportedBase } = opts;

  const savedStats = await dataGet('pb-stats', false);
  debuglog('real-base-stats', 'Saved supported base stats:', savedStats);
  if (! savedStats) {
    isModifyingSupportedBases = false;
    return;
  }

  const recommended = document.querySelector('.trapSelectorView__browserStateParent--items[data-blueprint-type="base"] .recommended');
  if (! recommended) {
    isModifyingSupportedBases = false;
    return;
  }

  let baseFound = false;

  supportedBases.forEach((base) => {
    const baseElement = document.querySelector(`.campPage-trap-itemBrowser-item.base.${base.slug}`);
    if (baseElement) {
      baseFound = true;
    }

    if (baseElement && ! baseElement.getAttribute('data-pinned')) {
      const header = recommended.querySelector('.campPage-trap-itemBrowser-tagGroup-name');
      if (header) {
        header.after(baseElement);
      }

      baseElement.setAttribute('data-pinned', true);
    }
  });

  if (! baseFound) {
    if (! retrySupportedBase) {
      debuglog('real-base-stats', 'Supported base not found, retrying in 500 ms');
      setTimeout(modifySupportedBases, 500, { retrySupportedBase: true });
    }

    isModifyingSupportedBases = false;
    return;
  }

  setSupportedBaseStats();

  isModifyingSupportedBases = false;
};

let isModifyingFixedBases = false;

/**
 * Modify the fixed base stats.
 */
const modifyFixedBases = () => {
  if (isModifyingFixedBases) {
    return;
  }

  const activeBp = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
  if (! activeBp) {
    return;
  }

  const bpType = activeBp.getAttribute('data-blueprint-type');
  if (! bpType || bpType !== 'base') {
    return;
  }

  isModifyingFixedBases = true;

  try {
    for (const override of fixedBaseStatOverrides) {
      const base = document.querySelector(override.selector);
      if (base) {
        updateTrapStatsDisplay(base, override.stats);
      }
    }
  } finally {
    isModifyingFixedBases = false;
  }
};

let isSavingSupportedBaseStats = false;

/**
 * Save the supported base stats.
 */
const saveSupportedBaseStats = () => {
  if (isSavingSupportedBaseStats) {
    return;
  }

  isSavingSupportedBaseStats = true;

  const setup = getUserSetupDetails();
  const isEquipped = supportedBases.some((base) => setup?.base?.id === base.id);
  if (! isEquipped) {
    isSavingSupportedBaseStats = false;
    return;
  }

  debuglog('real-base-stats', 'Saving supported base stats…');

  const trapMath = document.querySelectorAll('.campPage-trap-trapStat-mathRow');
  if (! trapMath.length) {
    isSavingSupportedBaseStats = false;
    return;
  }

  const stats = {};

  for (const row of trapMath) {
    const stat = row.querySelector('.campPage-trap-trapStat-mathRow-name');
    if (! stat) {
      continue;
    }

    const isTargetStat = supportedBases.some((base) => stat.innerText.includes(base.name));
    if (! isTargetStat) {
      continue;
    }

    const value = row.querySelector('.campPage-trap-trapStat-mathRow-value');
    if (! value) {
      continue;
    }

    const type = row.parentElement?.parentElement;
    if (! type) {
      continue;
    }

    let parsedValue = parseNumber(value.innerText);
    const typeClass = type.className
      .replace('campPage-trap-trapStat', '')
      .trim();

    if ('power' === typeClass) {
      parsedValue = parsedValue + 490;
    } else if ('luck' === typeClass) {
      parsedValue = parsedValue + 5;
    }

    stats[typeClass] = parsedValue;
  }

  if (! stats.power || ! stats.luck) {
    isSavingSupportedBaseStats = false;
    return;
  }

  debuglog('real-base-stats', 'Supported base stats:', stats);
  dataSet('pb-stats', stats);

  isSavingSupportedBaseStats = false;
};

/**
 * Helper function to run the module.
 */
const run = () => {
  setSupportedBaseStats();
  modifySupportedBases();
  saveSupportedBaseStats();
  modifyFixedBases();
  setTimeout(modifyFixedBases, 500);
};

/**
 * Initialize the module.
 */
const init = () => {
  onEvent('camp_page_toggle_blueprint', run);
  onRequest('users/changetrap.php', run);
};

/**
 * Initialize the module.
 */
export default {
  id: 'real-base-stats',
  name: 'Real Base Stats',
  type: 'hunting-setup',
  default: true,
  description: 'Show the correct stats for Prestige, Hailstone, Denture, and Printing bases in the trap selector.',
  load: init,
};
