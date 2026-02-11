import {
  dataGet,
  dataSet,
  debuglog,
  getUserSetupDetails,
  onEvent,
  onRequest,
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

/**
 * Update the Prestige Base stats display.
 */
const setPrestigeStats = async () => {
  // update the stats display
  const pbStats = await dataGet('pb-stats', false);
  if (! pbStats) {
    return;
  }

  // 1. Update the stats in the item browser (trap selector)
  supportedBases.forEach((base) => {
    const baseElement = document.querySelector(`.campPage-trap-itemBrowser-item.base.${base.slug}`);
    if (baseElement) {
      updateTrapStatsDisplay(baseElement, pbStats);
    }
  });

  // 2. Update the stats if the base is currently armed
  const armed = document.querySelector('.campPage-trap-itemBrowser-armed-item.base');
  if (! armed) {
    return;
  }

  const name = armed.querySelector('.campPage-trap-itemBrowser-item-name');
  if (! name) {
    return;
  }

  // Check if the armed item matches one of our supported bases
  const isSupportedBase = supportedBases.some((base) => name.innerText.includes(base.name));
  if (isSupportedBase) {
    updateTrapStatsDisplay(armed, pbStats);
  }
};

let isModifying = false;

/**
 * Modify the Prestige Base in the base selector.
 *
 * @param {Object} opts The options object.
 */
const modifyPB = async (opts) => {
  if (isModifying) {
    return;
  }

  isModifying = true;

  const activeBp = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
  if (! activeBp) {
    isModifying = false;
    return;
  }

  const bpType = activeBp.getAttribute('data-blueprint-type');
  if (! bpType || bpType !== 'base') {
    isModifying = false;
    return;
  }

  const { retryPrestige } = opts || {};

  const savedStats = await dataGet('pb-stats', false);
  debuglog('prestige-base-stats', 'Saved Prestige Base stats:', savedStats);
  if (! savedStats) {
    isModifying = false;
    return;
  }

  const recommended = document.querySelector('.trapSelectorView__browserStateParent--items[data-blueprint-type="base"] .recommended');
  if (! recommended) {
    isModifying = false;
    return;
  }

  // Loop through each supported base and pin it if found
  let baseFound = false;

  supportedBases.forEach((base) => {
    const baseElement = document.querySelector(`.campPage-trap-itemBrowser-item.base.${base.slug}`);

    // If the base exists and isn't already pinned
    if (baseElement && ! baseElement.getAttribute('data-pinned')) {
      baseFound = true;
      const header = recommended.querySelector('.campPage-trap-itemBrowser-tagGroup-name');
      if (header) {
        header.after(baseElement);
      }

      baseElement.setAttribute('data-pinned', true);
    }
  });

  // If we didn't find any base, try again later
  if (! baseFound) {
    if (! retryPrestige) {
      debuglog('prestige-base-stats', 'Prestige base not found, retrying in 500 ms');
      setTimeout(modifyPB, 500, { retryPrestige: true });
    }
    isModifying = false;
    return;
  }

  // Update displays after moving them
  setPrestigeStats();

  isModifying = false;
};

let isSaving = false;

/**
 * Save the Prestige Base stats.
 */
const savePbStats = () => {
  if (isSaving) {
    return;
  }

  isSaving = true;

  // if we have pb equipped, then save the stats for it
  const setup = getUserSetupDetails();
  const isEquipped = supportedBases.some((base) => setup.base.id === base.id);
  if (! isEquipped) {
    isSaving = false;
    return;
  }

  debuglog('prestige-base-stats', 'Saving Prestige Base stats…');

  const trapMath = document.querySelectorAll('.campPage-trap-trapStat-mathRow');
  if (! trapMath.length) {
    isSaving = false;
    return;
  }

  const stats = {};

  trapMath.forEach((row) => {
    // get the name of the stat
    const stat = row.querySelector('.campPage-trap-trapStat-mathRow-name');
    if (! stat) {
      isSaving = false;
      return;
    }

    const isTargetStat = supportedBases.some((base) => stat.innerText.includes(base.name));
    if (! isTargetStat) {
      isSaving = false;
      return;
    }

    // get the value of the stat
    const value = row.querySelector('.campPage-trap-trapStat-mathRow-value');
    if (! value) {
      isSaving = false;
      return;
    }

    // parse the value, remove commas and convert to a number
    let parsedValue = Number.parseInt(value.innerText.replaceAll(',', ''), 10);

    // get the type of stat it is by looking at the great grandparent
    const type = row.parentElement.parentElement;
    // remove 'campPage-trap-trapStat' from the class list
    const typeClass = type.className
      .replace('campPage-trap-trapStat', '')
      .trim();

    if (typeClass === 'power') {
      parsedValue = parsedValue + 490;
    } else if (typeClass === 'luck') {
      parsedValue = parsedValue + 5;
    }

    stats[typeClass] = parsedValue;
  });

  if (! stats.power || ! stats.luck) {
    isSaving = false;
    return;
  }

  debuglog('prestige-base-stats', 'Prestige Base stats:', stats);
  dataSet('pb-stats', stats);

  isSaving = false;
};

/**
 * Helper function to run the module.
 */
const run = async () => {
  modifyPB();
  savePbStats();
};

/**
 * Initialize the module.
 */
const init = async () => {
  onEvent('camp_page_toggle_blueprint', run);
  onRequest('users/changetrap.php', run);
};

/**
 * Initialize the module.
 */
export default {
  id: 'prestige-base-stats',
  name: 'Prestige Base Stats',
  type: 'feature',
  default: true,
  description: 'Show the correct stats for the Prestige Base in the base selector.',
  load: init,
};
