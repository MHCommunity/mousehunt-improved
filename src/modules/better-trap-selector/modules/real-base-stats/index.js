import { dataGet, dataSet, debuglog, getCurrentLocation, getData, getUserSetupDetails, onEvent, onRequest, parseNumber, updateTrapStatsDisplay } from '@utils';

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
    id: 2647,
    stats: {
      power: 1500,
      powerBonus: 25,
      luck: 20,
      attractionBonus: 25,
    },
  },
  {
    selector: '.campPage-trap-itemBrowser-item.base.upgraded_denture_base',
    id: 3023,
    stats: {
      power: 3750,
      powerBonus: 25,
      luck: 50,
      attractionBonus: 25,
    },
  },
  {
    selector: '.campPage-trap-itemBrowser-item.base.folklore_printing_press_base',
    region: 'folklore_forest',
    id: 3683,
    stats: {
      power: 4500,
      powerBonus: 35,
      luck: 57,
      attractionBonus: 35,
    },
  },
  {
    selector: '.campPage-trap-itemBrowser-item.base.naughty_list_printing_press_base',
    region: 'folklore_forest',
    id: 3628,
    stats: {
      power: 4500,
      powerBonus: 35,
      luck: 57,
      attractionBonus: 35,
    },
  },
];

// Location IDs keyed by region, used for overrides that only apply in a region.
const regionLocations = {};

/**
 * Get the fixed base overrides that apply at the current location.
 *
 * @return {Object[]} The active overrides.
 */
const getActiveFixedBaseOverrides = () => {
  const location = getCurrentLocation();
  return fixedBaseStatOverrides.filter((override) => !override.region || regionLocations[override.region]?.has(location));
};

/**
 * Update the saved supported base stats display.
 */
const setSupportedBaseStats = async () => {
  const savedStats = await dataGet('pb-stats', false);
  if (!savedStats) {
    return;
  }

  supportedBases.forEach((base) => {
    const baseElement = document.querySelector(`.campPage-trap-itemBrowser-item.base.${base.slug}`);
    if (baseElement) {
      updateTrapStatsDisplay(baseElement, savedStats);
    }
  });

  const armed = document.querySelector('.campPage-trap-itemBrowser-armed-item.base');
  if (!armed) {
    return;
  }

  const name = armed.querySelector('.campPage-trap-itemBrowser-item-name');
  if (!name) {
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

  // Always clear the flag, otherwise a failed read would stop the module until the page reloads.
  try {
    const activeBp = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
    if (!activeBp) {
      return;
    }

    const bpType = activeBp.getAttribute('data-blueprint-type');
    if (!bpType || bpType !== 'base') {
      return;
    }

    const { retrySupportedBase } = opts;

    const savedStats = await dataGet('pb-stats', false);
    debuglog('real-base-stats', 'Saved supported base stats:', savedStats);
    if (!savedStats) {
      return;
    }

    const recommended = document.querySelector('.trapSelectorView__browserStateParent--items[data-blueprint-type="base"] .recommended');
    if (!recommended) {
      return;
    }

    let baseFound = false;

    supportedBases.forEach((base) => {
      const baseElement = document.querySelector(`.campPage-trap-itemBrowser-item.base.${base.slug}`);
      if (baseElement) {
        baseFound = true;
      }

      if (baseElement && !baseElement.getAttribute('data-pinned')) {
        const header = recommended.querySelector('.campPage-trap-itemBrowser-tagGroup-name');
        if (header) {
          header.after(baseElement);
        }

        baseElement.setAttribute('data-pinned', true);
      }
    });

    if (!baseFound) {
      if (!retrySupportedBase) {
        debuglog('real-base-stats', 'Supported base not found, retrying in 500 ms');
        setTimeout(modifySupportedBases, 500, { retrySupportedBase: true });
      }

      return;
    }

    setSupportedBaseStats();
  } finally {
    isModifyingSupportedBases = false;
  }
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
  if (!activeBp) {
    return;
  }

  const bpType = activeBp.getAttribute('data-blueprint-type');
  if (!bpType || bpType !== 'base') {
    return;
  }

  isModifyingFixedBases = true;

  try {
    for (const override of getActiveFixedBaseOverrides()) {
      const base = document.querySelector(override.selector);
      if (base) {
        updateTrapStatsDisplay(base, override.stats);
      }
    }

    // The armed item doesn't have the base slug class, and the game shows its uncharged stats, so use the real stats from the camp page.
    const setup = getUserSetupDetails();
    const armed = document.querySelector('.campPage-trap-itemBrowser-armed-item.base');
    if (armed && setup?.base?.power && getActiveFixedBaseOverrides().some((override) => override.id === setup.base.id)) {
      updateTrapStatsDisplay(armed, {
        power: setup.base.power,
        powerBonus: setup.base.powerBonus,
        luck: setup.base.luck,
        attractionBonus: Math.round(setup.base.attractionBonus * 100),
      });
    }
  } finally {
    isModifyingFixedBases = false;
  }
};

/**
 * Save the supported base stats.
 */
const saveSupportedBaseStats = () => {
  const setup = getUserSetupDetails();
  const isEquipped = supportedBases.some((base) => setup?.base?.id === base.id);
  if (!isEquipped) {
    return;
  }

  debuglog('real-base-stats', 'Saving supported base stats…');

  const trapMath = document.querySelectorAll('.campPage-trap-trapStat-mathRow');
  if (!trapMath.length) {
    return;
  }

  const stats = {};

  for (const row of trapMath) {
    const stat = row.querySelector('.campPage-trap-trapStat-mathRow-name');
    if (!stat) {
      continue;
    }

    const isTargetStat = supportedBases.some((base) => stat.innerText.includes(base.name));
    if (!isTargetStat) {
      continue;
    }

    const value = row.querySelector('.campPage-trap-trapStat-mathRow-value');
    if (!value) {
      continue;
    }

    const type = row.parentElement?.parentElement;
    if (!type) {
      continue;
    }

    let parsedValue = parseNumber(value.innerText);
    const typeClass = type.className.replace('campPage-trap-trapStat', '').trim();

    // The bonus rows live in the same container as their base stat, e.g. Power Bonus is inside the power stat.
    if (value.innerText.includes('%')) {
      if ('power' === typeClass) {
        stats.powerBonus = parsedValue;
      } else if ('attraction_bonus' === typeClass) {
        stats.attractionBonus = parsedValue;
      }

      continue;
    }

    if ('power' === typeClass) {
      parsedValue = parsedValue + 490;
    } else if ('luck' === typeClass) {
      parsedValue = parsedValue + 5;
    }

    stats[typeClass] = parsedValue;
  }

  if (!stats.power || !stats.luck) {
    return;
  }

  debuglog('real-base-stats', 'Supported base stats:', stats);
  dataSet('pb-stats', stats);
};

const sortByStatClasses = {
  power: 'power',
  power_bonus: 'powerBonus',
  luck: 'luck',
  attraction_bonus: 'attraction_bonus',
};

/**
 * Get the displayed value of a stat on an item.
 *
 * @param {Element} item      The item element.
 * @param {string}  statClass The stat class name.
 *
 * @return {number} The stat value.
 */
const getDisplayedStat = (item, statClass) => {
  const value = item.querySelector(`.campPage-trap-itemBrowser-item-stat.${statClass} .value span`);
  return value ? parseNumber(value.innerText) || 0 : 0;
};

/**
 * Move the bases with overridden stats to where they belong in the sorted list, as the game sorts by the stats it knows about.
 */
const repositionSortedBases = () => {
  const sortBy = document.querySelector('.campPage-trap-itemBrowser-filter.sortBy select')?.value;
  const statClass = sortByStatClasses[sortBy];
  if (!statClass) {
    return;
  }

  const selectors = [...getActiveFixedBaseOverrides().map((override) => override.selector), ...supportedBases.map((base) => `.campPage-trap-itemBrowser-item.base.${base.slug}`)];

  for (const selector of selectors) {
    const base = document.querySelector(`.campPage-trap-itemBrowser-tagGroup ${selector}`);
    if (!base) {
      continue;
    }

    const value = getDisplayedStat(base, statClass);
    const siblings = [...base.parentElement.querySelectorAll(':scope > .campPage-trap-itemBrowser-item')].filter((item) => item !== base);
    const before = siblings.find((item) => getDisplayedStat(item, statClass) < value);

    if (before) {
      before.before(base);
    } else if (siblings.length) {
      siblings.at(-1).after(base);
    }
  }
};

/**
 * Helper function to run the module.
 */
const run = () => {
  setSupportedBaseStats();
  modifySupportedBases();
  saveSupportedBaseStats();
  modifyFixedBases();
  repositionSortedBases();

  setTimeout(() => {
    modifyFixedBases();
    repositionSortedBases();
  }, 500);
};

/**
 * Re-run after the trap selector filters change, as the game re-renders the item list without firing an event.
 *
 * @param {Event} event The change or keyup event.
 */
const runAfterFilterChange = (event) => {
  if (!event.target?.closest?.('.campPage-trap-itemBrowser-filter')) {
    return;
  }

  // The game renders right after its change handler, but debounces the search input by 200 ms.
  setTimeout(run, 'keyup' === event.type ? 250 : 0);
};

/**
 * Initialize the module.
 */
const init = async () => {
  const environments = await getData('environments');
  if (Array.isArray(environments)) {
    for (const environment of environments) {
      regionLocations[environment.region] ??= new Set();
      regionLocations[environment.region].add(environment.id);
    }
  }

  onEvent('camp_page_toggle_blueprint', run);
  // Use capture, the quick sort links dispatch a change event that doesn't bubble.
  document.addEventListener('change', runAfterFilterChange, true);
  document.addEventListener('keyup', runAfterFilterChange, true);
  // Request callbacks run before the game updates the trap, so give it a moment first.
  onRequest('users/changetrap.php', () => setTimeout(run, 250));
};

export default init;
