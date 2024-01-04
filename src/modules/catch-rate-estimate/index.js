import { addStyles, getCurrentPage, onPageChange, onRequest } from '@utils';

import settings from './settings';
import styles from './styles.css';

import allMiceInfo from '@data/mice-effs.json';

const allTypes = [
  'Arcane',
  'Draconic',
  'Forgotten',
  'Hydro',
  'Parental',
  'Physical',
  'Shadow',
  'Tactical',
  'Law',
  'Rift'
];

const updateMinLucks = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const effectiveness = await getMiceEffectivness();

  const miceNames = Object.values(effectiveness)
    .flatMap(({ mice }) => mice)
    .flatMap(({ name }) => name);

  renderList(miceNames);
};

function renderList(list) {
  const minWrap = document.querySelector('#minluck-list');
  if (minWrap) {
    minWrap.remove();
  }
  const mintable = document.querySelector('#minluck-list-table');
  if (mintable) {
    mintable.remove();
  }

  const powerEl = document.querySelector('.campPage-trap-trapStat.power');
  const luckEl = document.querySelector('.campPage-trap-trapStat.luck');
  const powerTypeEl = document.querySelector('.campPage-trap-trapStat.power');

  if (! powerEl || ! luckEl || ! powerTypeEl) {
    return;
  }

  const luck = luckEl.innerText.match(/\d/g).join('');
  const power = powerEl.innerText.match(/\d/g).join('');
  const powerType = powerTypeEl.innerText.match(/[A-Za-z]/g).join('');

  const minluckList = document.createElement('div');
  minluckList.id = 'minluck-list';
  minluckList.className = 'campPage-trap-trapEffectiveness';

  const miceheader = document.createElement('th');
  miceheader.innerText = 'Mouse';
  miceheader.classList = 'mousename-header';

  const table = document.createElement('table');
  table.id = 'minluck-list-table';
  table.append(miceheader);

  const minluckheader = document.createElement('th');
  minluckheader.innerText = 'Minluck';
  table.append(minluckheader);

  const crheader = document.createElement('th');
  crheader.innerText = 'CRE';
  table.append(crheader);

  const totalStats = { good: 0, bad: 0, okay: 0, total: 0 };

  for (const mouseNameConverted of list) {
    const powerIndex = allTypes.indexOf(powerType);
    const micePower = allMiceInfo[mouseNameConverted].power;
    const miceEff = allMiceInfo[mouseNameConverted].effs[powerIndex];
    const minluckString = replaceInfinity(micePower, miceEff);
    const catchRateString = convertToCR(power, luck, micePower, miceEff);

    const row = document.createElement('tr');
    row.className = 'minlucklist-minluck-row';

    const mouseName = document.createElement('td');
    mouseName.innerText = mouseNameConverted;
    mouseName.className = 'minlucklist-minluck-name';
    row.append(mouseName);

    const minLuck = document.createElement('td');
    minLuck.className = 'minlucklist-minluck-data' + (luck >= minluckString ? ' minlucklist-minluck-data-good' : '');
    minLuck.innerText = minluckString;
    row.append(minLuck);

    const catchRate = document.createElement('td');
    catchRate.innerText = catchRateString;
    if (catchRateString === '100.00%') {
      totalStats.good += 1;
      catchRate.className = 'minlucklist-minluck-data minlucklist-minluck-data-good';
    } else if ((Number.parseInt(catchRateString)) <= 60) {
      totalStats.bad += 1;
      catchRate.className = 'minlucklist-minluck-data minlucklist-minluck-data-bad';
    } else {
      catchRate.className = 'minlucklist-minluck-data';
    }
    totalStats.total += 1;
    row.append(catchRate);

    table.append(row);
  }

  minluckList.append(table);

  const statsContainer = document.querySelector('.campPage-trap-statsContainer');
  if (statsContainer) {
    statsContainer.append(minluckList);
  }

  const trap = document.querySelectorAll('.trapImageView-layerWrapper')[0];

  trap.classList.remove('minluck-indicator-all-good');
  trap.classList.remove('minluck-indicator-bad');
  trap.classList.remove('minluck-indicator-good');
  trap.classList.remove('minluck-indicator-none');

  if (totalStats.good === totalStats.total) {
    trap.classList.add('minluck-indicator-all-good');
  } else if (totalStats.bad === totalStats.total) {
    trap.classList.add('minluck-indicator-bad');
  } else if (totalStats.good > totalStats.total / 2) {
    trap.classList.add('minluck-indicator-good');
  } else {
    trap.classList.add('minluck-indicator-none');
  }

  const rowData = table.querySelectorAll('tr');

  for (let i = 0; i < rowData.length - 1; i++) {
    for (let j = 0; j < rowData.length - (i + 1); j++) {
      if (Number(rowData.item(j).querySelectorAll('td').item(1).innerHTML.replaceAll(/[^\d.]+/g, '')) < Number(rowData.item(j + 1).querySelectorAll('td').item(1).innerHTML.replaceAll(/[^\d.]+/g, ''))) {
        table.insertBefore(rowData.item(j + 1), rowData.item(j));
      }
    }
  }
}

const getUserHash = () => {
  // eslint-disable-next-line no-undef
  if (typeof unsafeWindow !== 'undefined' && unsafeWindow.user.unique_hash) {
    // eslint-disable-next-line no-undef
    return unsafeWindow.user.unique_hash;
  }

  // if window.user exists, return the hash
  if (window.user && window.user.unique_hash) {
    return window.user.unique_hash;
  }
};

const getMiceEffectivness = async () => {
  const response = await fetch('https://www.mousehuntgame.com/managers/ajax/users/getmiceeffectiveness.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'sn=Hitgrab&hg_is_ajax=1&uh=' + getUserHash(),
  });

  const responseText = await response.text();
  const data = JSON.parse(responseText);

  return data?.effectiveness;
};

function replaceInfinity(mousePower, eff) {
  // Can't evalute infinity symbol, so was replaced with 9999 as minluck instead
  const infinitySym = String.fromCodePoint(0x221E);
  eff = eff / 100;

  if (eff === 0) {
    return infinitySym;
  }

  const minluck = Math.ceil(Math.ceil(Math.sqrt(mousePower / 2)) / Math.min(eff, 1.4));
  if (minluck >= 9999) {
    return infinitySym;
  }

  if (2 * Math.pow(Math.floor(Math.min(1.4, eff) * minluck), 2) >= mousePower) {
    return minluck;
  }

  return minluck + 1;
}

function convertToCR(power, luck, mPower, mEff) {
  mEff = mEff / 100;
  // eslint-disable-next-line no-mixed-operators
  let result = Math.min(1, (power * mEff + 2 * Math.pow(Math.floor(luck * Math.min(mEff, 1.4)), 2)) / (mPower + power * mEff));
  result = (result * 100).toFixed(2) + '%';
  return result;
}

const makeMinLuckButton = () => {
  const button = document.querySelector('#minluck-button');
  if (! button) {
    const minluckButton = document.createElement('a');
    minluckButton.id = 'minluck-button';
    minluckButton.classList.add('campPage-trap-trapEffectiveness');
    minluckButton.textContent = '🐭️ Minluck & Catch Rate Estimate';

    const statsContainer = document.querySelector('.campPage-trap-statsContainer');
    if (statsContainer) {
      statsContainer.append(minluckButton);
    }
  }
};

const main = () => {
  onRequest(updateMinLucks, '/managers/ajax/users/changetrap.php');
  onPageChange({ change: updateMinLucks });

  makeMinLuckButton();
  updateMinLucks();

  setTimeout(() => {
    makeMinLuckButton();
    updateMinLucks();
  }, 750);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
  main();
};

export default {
  id: 'catch-rate-estimate',
  name: 'Catch Rate Estimate',
  type: 'feature',
  default: true,
  description: 'Minluck and catch rate estimates.',
  load: init,
  settings,
  beta: true,
};
