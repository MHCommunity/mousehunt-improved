import {
  debuglog,
  getUserSetupDetails,
  onEvent,
  onRequest,
  sessionGet,
  sessionSet
} from '@utils';

const setPrestigeStats = () => {
  const prestige = document.querySelector('.campPage-trap-itemBrowser-item.base.valour_rift_prestige_base');
  if (! prestige) {
    return;
  }

  // update the stats display
  const pbStats = sessionGet('mh-ui-pb-stats', false);
  if (! pbStats) {
    return;
  }

  const stats = prestige.querySelector('.campPage-trap-itemBrowser-item-statContainer');
  if (! stats) {
    return;
  }

  const currentSetup = getUserSetupDetails();

  const power = stats.querySelector('.campPage-trap-itemBrowser-item-stat.power');
  if (power) {
    const powerValue = power.querySelector('.value span');
    if (powerValue) {
      powerValue.innerText = pbStats.power;

      power.classList.remove('better', 'worse');
      // if the power is higher than the current setup, then add a class to it
      if (currentSetup.base.power < pbStats.power) {
        power.classList.add('better');
      } else if (currentSetup.base.power > pbStats.power) {
        power.classList.add('worse');
      }
    }
  }

  const luck = stats.querySelector('.campPage-trap-itemBrowser-item-stat.luck');
  if (luck) {
    const luckValue = luck.querySelector('.value span');
    if (luckValue) {
      luckValue.innerText = pbStats.luck;

      luck.classList.remove('better', 'worse');

      if (currentSetup.base.luck < pbStats.luck) {
        luck.classList.add('better');
      } else if (currentSetup.base.luck > pbStats.luck) {
        luck.classList.add('worse');
      }
    }
  }
};

const modifyPB = (opts) => {
  const activeBp = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
  if (! activeBp) {
    return;
  }

  const bpType = activeBp.getAttribute('data-blueprint-type');
  if (! bpType || bpType !== 'base') {
    return;
  }

  const { retryPrestige, retryRecommended } = opts || {};

  const savedStats = sessionGet('mh-ui-pb-stats', false);
  debuglog('prestige-base-stats', 'Saved Prestige Base stats:', savedStats);
  if (! savedStats) {
    return;
  }

  const prestige = document.querySelector('.campPage-trap-itemBrowser-item.base.valour_rift_prestige_base');
  if (! prestige) {
    if (! retryPrestige) {
      setTimeout(() => {
        modifyPB({ retryPrestige: true });
      }, 500);
    }

    return;
  }

  if (prestige.getAttribute('data-pinned')) {
    return;
  }

  const recommended = document.querySelector('.trapSelectorView__browserStateParent--items[data-blueprint-type="base"] .recommended');

  if (! recommended) {
    if (! retryRecommended) {
      setTimeout(() => {
        modifyPB({ retryRecommended: true });
      }, 500);
    }

    return;
  }

  if (recommended) {
    const header = recommended.querySelector('.campPage-trap-itemBrowser-tagGroup-name');
    if (! header) {
      return;
    }

    header.after(prestige);
  }

  prestige.setAttribute('data-pinned', true);
  setPrestigeStats();
};

const savePbStats = () => {
  // if we have pb equipped, then save the stats for it
  const setup = getUserSetupDetails();
  if (setup.base.id !== 2904) {
    return;
  }

  debuglog('prestige-base-stats', 'Saving Prestige Base stats…');

  const trapMath = document.querySelectorAll('.campPage-trap-trapStat-mathRow');
  if (! trapMath.length) {
    return;
  }

  const stats = {};

  trapMath.forEach((row) => {
    // get the name of the stat
    const stat = row.querySelector('.campPage-trap-trapStat-mathRow-name');
    if (! stat) {
      return;
    }

    // if the name doesn't contain Prestige Base, then skip it
    if (! stat.innerText.includes('Prestige Base')) {
      return;
    }

    // get the value of the stat
    const value = row.querySelector('.campPage-trap-trapStat-mathRow-value');
    if (! value) {
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
    return;
  }

  debuglog('prestige-base-stats', 'Prestige Base stats:', stats);
  sessionSet('mh-ui-pb-stats', stats);
};

/**
 * Initialize the module.
 */
const init = async () => {
  onEvent('camp_page_toggle_blueprint', () => {
    savePbStats();
    setTimeout(() => {
      modifyPB();
    }, 500);
  });

  onRequest('users/changetrap.php', () => {
    savePbStats();
    modifyPB();
  });

  onRequest('users/gettrapcomponents.php', () => {
    savePbStats();
    modifyPB();
  });
};

export default {
  id: 'prestige-base-stats',
  name: 'Prestige Base Stats',
  type: 'feature',
  default: true,
  description: 'Shows the correct stats for the Prestige Base in the base selector.',
  load: init,
};
