import {
  dataGet,
  dataSet,
  debuglog,
  getUserSetupDetails,
  onEvent,
  onRequest,
  updateTrapStatsDisplay
} from '@utils';

/**
 * Update the Prestige Base stats display.
 */
const setPrestigeStats = async () => {
  const prestige = document.querySelector('.campPage-trap-itemBrowser-item.base.valour_rift_prestige_base');
  if (! prestige) {
    return;
  }

  // update the stats display
  const pbStats = await dataGet('pb-stats', false);
  if (! pbStats) {
    return;
  }

  updateTrapStatsDisplay(prestige, pbStats);

  const armed = document.querySelector('.campPage-trap-itemBrowser-armed-item.base');
  if (! armed) {
    return;
  }

  const name = armed.querySelector('.campPage-trap-itemBrowser-item-name');
  if (! name) {
    return;
  }

  if (name.innerText.includes('Prestige Base')) {
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

  const prestige = document.querySelector('.campPage-trap-itemBrowser-item.base.valour_rift_prestige_base');
  if (! prestige) {
    if (! retryPrestige) {
      setTimeout(() => {
        modifyPB({ retryPrestige: true });
      }, 500);
    }

    isModifying = false;
    return;
  }

  if (prestige.getAttribute('data-pinned')) {
    isModifying = false;
    return;
  }

  const recommended = document.querySelector('.trapSelectorView__browserStateParent--items[data-blueprint-type="base"] .recommended');
  if (! recommended) {
    isModifying = false;
    return;
  }

  const header = recommended.querySelector('.campPage-trap-itemBrowser-tagGroup-name');
  if (header) {
    header.after(prestige);
  }

  prestige.setAttribute('data-pinned', true);
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
  if (setup.base.id !== 2904) {
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

    // if the name doesn't contain Prestige Base, then skip it
    if (! stat.innerText.includes('Prestige Base')) {
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
