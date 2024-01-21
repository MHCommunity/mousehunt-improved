import { addStyles, getSetting, makeElement, onNavigation } from '@utils';

import settings from './settings';
import styles from './styles.css';

import cottonCandyStyles from './cotton-candy.css';

const doClass = (el, shieldClass, verb) => {
  const classToAdd = shieldClass.replace('.', ' ');

  classToAdd.split(' ').forEach((className) => {
    el.classList[verb](className);
  });
};

const addClass = (el, shieldClass) => {
  doClass(el, shieldClass, 'add');
};

const removeClass = (el, shieldClass) => {
  doClass(el, shieldClass, 'remove');
};

let lastShield = '';
const changeShield = () => {
  const shieldEl = document.querySelector('.mousehuntHud-shield');
  if (! shieldEl) {
    return;
  }

  const timer = document.querySelector('.huntersHornView__timer--default');
  if (! timer) {
    return;
  }

  // Remove the old shield class.
  if (lastShield) {
    const remove = [
      'mhui-custom-shield',
      lastShield,
      `${lastShield}-alt`,
      'alt',
      'title',
      'default',
    ];

    remove.forEach((className) => {
      removeClass(shieldEl, className);
    });
  }

  // Remove the old timer class.
  timer.classList.remove(lastShield);

  // Get the new shield.
  let shield = getSetting('custom-shield-0', 'default');
  if ('default' === shield) {
    shieldEl.classList.add('default');
    return;
  }

  // If it's cotton candy, add the style, otherwise remove it.
  if (shield === 'color-cotton-candy') {
    makeElement('style', 'mh-improved-cotton-candy-style', cottonCandyStyles, document.head);

    shield = 'color-pink-timer';
  } else {
    const cottonCandyStyle = document.querySelector('.mh-improved-cotton-candy-style');
    if (cottonCandyStyle) {
      cottonCandyStyle.remove();
    }
  }

  if (shield.startsWith('color-')) {
    shieldEl.classList.add('default');
  }

  if (shield.endsWith('-timer')) {
    shield = shield.replace('-timer', '');
    timer.classList.add(shield);
  }

  // if its the alt, also add the non-alt class.
  if (shield.endsWith('-alt')) {
    shieldEl.classList.add(shield.replace('-alt', ''), 'alt');
  }

  if (shield.includes('title')) {
    shieldEl.classList.add('title');
    shield = 'title' === shield ? getTitle() : shield;
  }

  shieldEl.classList.add('mhui-custom-shield');
  addClass(shieldEl, shield);

  lastShield = shield;
};

const getTitle = () => {
  let title = user.title_name || 'novice';
  title = title.toLowerCase();

  title.replace('lady', 'lord');
  title.replace('wo', '');
  title.replace('ess', '');
  title.replace('duch', 'duke');

  return title;
};

const watchForPreferenceChanges = () => {
  const input = document.querySelector('#mousehunt-improved-settings-feature-custom-shield select');
  if (! input) {
    return;
  }

  input.addEventListener('change', () => {
    changeShield();
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  lastShield = getSetting('custom-shield-0', 'default');

  changeShield();

  onNavigation(watchForPreferenceChanges, {
    page: 'preferences',
    onLoad: true,
  });
};

export default {
  id: 'custom-shield',
  name: 'Custom Shield',
  type: 'feature',
  default: false,
  description: 'Change your shield in the HUD to a variety of different options.',
  load: init,
  alwaysLoad: true,
  settings,
};
