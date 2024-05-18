import {
  addStyles,
  getSetting,
  getUserTitle,
  makeElement,
  onNavigation
} from '@utils';

import settings from './settings';
import styles from './styles.css';

import cottonCandyStyles from './cotton-candy.css';

const doClass = (el, shieldClass, verb) => {
  // if shieldClass is an array, join it.
  if (Array.isArray(shieldClass)) {
    shieldClass = shieldClass.join(' ');
  }

  if (! shieldClass) {
    return;
  }

  let classToAdd = shieldClass.replace('.', ' ');
  classToAdd = classToAdd.split(' ');

  if (! Array.isArray(classToAdd)) {
    classToAdd = [classToAdd];
  }

  classToAdd.forEach((className) => {
    if (el && el.classList && el.classList[verb]) {
      if ('remove' === verb && ! el.classList.contains(className)) {
        return;
      }

      el.classList[verb](className);
    }
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
      ...lastShield,
      'mhui-custom-shield',
    ];

    remove.forEach((className) => {
      removeClass(shieldEl, className);
      timer.classList.remove(className);
    });
  }

  // Get the new shield.
  let shield = getSetting('custom-shield-0', 'default');
  if ('default' === shield) {
    shieldEl.classList.add('default', 'default-fancy');
    lastShield = ['default', 'default-fancy'];
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

  lastShield = [shield];

  if (shield.startsWith('color-')) {
    shieldEl.classList.add('default');
    shieldEl.classList.add('color');

    lastShield.push('color');
  }

  if (shield.endsWith('-timer')) {
    shield = shield.replace('-timer', '');
    timer.classList.add(shield);

    lastShield.push(shield);
  }

  // if its the alt, also add the non-alt class.
  if (shield.endsWith('-alt')) {
    const altClass = shield.replace('-alt', '');
    shieldEl.classList.add(altClass, 'alt');
    lastShield.push(altClass, 'alt');
  }

  if (shield.includes('title')) {
    shieldEl.classList.add('title');
    shield = 'title' === shield ? getUserTitle() : shield;
    lastShield.push('title', shield);
  }

  shieldEl.classList.add('mhui-custom-shield');
  addClass(shieldEl, shield);
};

const watchForPreferenceChanges = () => {
  const input = document.querySelector('#mousehunt-improved-settings-design-custom-shield select');
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
  addStyles(styles, 'custom-shield');

  lastShield = getSetting('custom-shield-0', 'default');

  changeShield();

  onNavigation(watchForPreferenceChanges, {
    page: 'preferences',
    onLoad: true,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-shield',
  type: 'design',
  alwaysLoad: true,
  load: init,
  settings,
};
