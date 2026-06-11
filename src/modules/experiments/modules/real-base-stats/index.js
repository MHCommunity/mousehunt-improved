import { onEvent, onRequest, updateTrapStatsDisplay } from '@utils';

let isModifying = false;

const baseStatOverrides = [
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
 * Modify the denture base stats.
 */
const modifyBases = () => {
  if (isModifying) {
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

  isModifying = true;

  try {
    for (const override of baseStatOverrides) {
      const base = document.querySelector(override.selector);
      if (base) {
        updateTrapStatsDisplay(base, override.stats);
      }
    }
  } finally {
    isModifying = false;
  }
};

/**
 * Helper function to run the module.
 */
const run = () => {
  modifyBases();
  setTimeout(modifyBases, 500);
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
  description: 'Show the upgraded stats for the Denture and Printing bases when in the trap selector.',
  load: init,
};
