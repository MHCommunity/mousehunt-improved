import { getUserSetupDetails, onPageChange, onRequest } from '@/utils';

const setPrestigeStats = () => {
  const prestige = document.querySelector('.campPage-trap-itemBrowser-item.base.valour_rift_prestige_base');
  if (! prestige) {
    return;
  }

  // update the stats display
  const savedStats = JSON.parse(localStorage.getItem('mh-improved-cache-pb-stats')) || false;
  if (! savedStats) {
    return;
  }

  const stats = prestige.querySelector('.campPage-trap-itemBrowser-item-statContainer');
  if (! stats) {
    return;
  }

  const setup = getUserSetupDetails();

  const power = stats.querySelector('.campPage-trap-itemBrowser-item-stat.power');
  if (power) {
    const powerValue = power.querySelector('.value span');
    if (powerValue) {
      powerValue.innerText = savedStats.power;

      // if the power is higher than the current setup, then add a class to it
      if (setup.power < savedStats.power) {
        power.classList.add('better');
      } else if (setup.power > savedStats.power) {
        power.classList.add('worse');
      }
    }
  }

  const luck = stats.querySelector('.campPage-trap-itemBrowser-item-stat.luck');
  if (luck) {
    const luckValue = luck.querySelector('.value span');
    if (luckValue) {
      luckValue.innerText = savedStats.luck;

      if (setup.luck < savedStats.luck) {
        luck.classList.add('better');
      } else if (setup.luck > savedStats.luck) {
        luck.classList.add('worse');
      }
    }
  }
};

const modifyPB = (retry = false) => {
  const prestige = document.querySelector('.campPage-trap-itemBrowser-item.base.valour_rift_prestige_base');
  if (! prestige) {
    // try again in 500ms but only once
    if (! retry) {
      setTimeout(() => {
        modifyPB(true);
      }, 500);
    }
    return;
  }

  // pin it to the top
  if (prestige.getAttribute('data-pinned')) {
    return;
  }

  const recomended = document.querySelector('.campPage-trap-itemBrowser.base .campPage-trap-itemBrowser-tagGroup.recommended');
  if (! recomended) {
    return;
  }

  prestige.setAttribute('data-pinned', true);

  // insert after the header
  const header = recomended.querySelector('.campPage-trap-itemBrowser-tagGroup-name');
  if (! header) {
    return;
  }

  header.insertAdjacentElement('afterend', prestige);

  setPrestigeStats();
};

const savePbStats = () => {
  // if we have pb equipped, then save the stats for it
  const setup = getUserSetupDetails();
  if (setup.base.id !== 2904) {
    return;
  }

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
    let parsedValue = parseInt(value.innerText.replace(/,/g, ''), 10);

    // get the type of stat it is by looking at the great grandparent
    const type = row.parentElement.parentElement;
    // remove 'campPage-trap-trapStat' from the class list
    const typeClass = type.className.replace('campPage-trap-trapStat', '').trim();

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

  localStorage.setItem('mh-improved-cache-pb-stats', JSON.stringify(stats));
};

export default () => {
  onPageChange({ blueprint: { show: () => {
    savePbStats();
    setTimeout(modifyPB, 500);
  } } });

  onRequest(() => {
    savePbStats();
    setPrestigeStats();
  }, 'managers/ajax/users/changetrap.php');

  onRequest(() => {
    savePbStats();
    setPrestigeStats();
  }, 'managers/ajax/users/gettrapcomponents.php');
};
