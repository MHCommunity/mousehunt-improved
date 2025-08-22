import { onEvent, onRequest, updateTrapStatsDisplay } from '@utils';

let isModifying = false;

/**
 * Modify the denture base stats.
 */
const modifyBases = async () => {
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

  const dentureBase = document.querySelector('.campPage-trap-itemBrowser-item.base.denture_base');
  if (dentureBase) {
    updateTrapStatsDisplay(dentureBase, {
      power: 1500,
      powerBonus: 25,
      luck: 20,
      attractionBonus: 25
    });
  }

  const upgradedDentureBase = document.querySelector('.campPage-trap-itemBrowser-item.base.upgraded_denture_base');
  if (upgradedDentureBase) {
    updateTrapStatsDisplay(upgradedDentureBase, {
      power: 3750,
      powerBonus: 25,
      luck: 50,
      attractionBonus: 25
    });
  }

  const printingBase = document.querySelector('.campPage-trap-itemBrowser-item.base.folklore_printing_press_base');
  if (printingBase) {
    updateTrapStatsDisplay(printingBase, {
      power: 4500,
      powerBonus: 35,
      luck: 57,
      attractionBonus: 35
    });
  }

  const OtherPrintingBase = document.querySelector('.campPage-trap-itemBrowser-item.base.naughty_list_printing_press_base');
  if (OtherPrintingBase) {
    updateTrapStatsDisplay(OtherPrintingBase, {
      power: 4500,
      powerBonus: 35,
      luck: 57,
      attractionBonus: 35
    });
  }

  isModifying = false;
};

/**
 * Helper function to run the module.
 */
const run = async () => {
  modifyBases();
  setTimeout(modifyBases, 500);
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
  id: 'real-base-stats',
  name: 'Real Base Stats',
  description: 'Show the upgraded stats for the Denture and Printing bases when in the trap selector.',
  load: init,
};
