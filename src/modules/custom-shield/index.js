import { addStyles, getSetting, getUserTitle, makeElement, onEvent } from '@utils';

import settings from './settings';
import styles from './styles.css';

import cottonCandyStyles from './cotton-candy.css';

const timerColorClasses = ['color-blue', 'color-cyan', 'color-faded', 'color-green', 'color-pink', 'color-purple', 'color-rainbow', 'color-red'];

/**
 * Add or remove a class from an element.
 *
 * @param {Element} el          The element to add the class to.
 * @param {string}  shieldClass The class to add.
 * @param {string}  verb        The action to take.
 */
const doClass = (el, shieldClass, verb) => {
  // if shieldClass is an array, join it.
  if (Array.isArray(shieldClass)) {
    shieldClass = shieldClass.join(' ');
  }

  if (!shieldClass) {
    return;
  }

  let classToAdd = shieldClass.replace('.', ' ');
  classToAdd = classToAdd.split(' ');

  if (!Array.isArray(classToAdd)) {
    classToAdd = [classToAdd];
  }

  classToAdd.forEach((className) => {
    if (el && el.classList && el.classList[verb]) {
      if ('remove' === verb && !el.classList.contains(className)) {
        return;
      }

      el.classList[verb](className);
    }
  });
};

/**
 * Add a class from an element.
 *
 * @param {Element} el          The element to add the class to.
 * @param {string}  shieldClass The class to add.
 */
const addClass = (el, shieldClass) => {
  doClass(el, shieldClass, 'add');
};

const removeCottonCandyStyle = () => {
  const cottonCandyStyle = document.querySelector('.mh-improved-cotton-candy-style');
  if (cottonCandyStyle) {
    cottonCandyStyle.remove();
  }
};

const removeTimerClasses = (timer) => {
  timer.classList.remove(...timerColorClasses);
};

/**
 * Change the shield based on the user's preference.
 */
const changeShield = () => {
  const shieldEl = document.querySelector('.mousehuntHud-shield');
  if (!shieldEl) {
    return;
  }

  // The timer is only needed for the timer colors, so don't skip the shield if it's missing.
  const timer = document.querySelector('.huntersHornView__timer--default, .huntersHornView__timer--legacy');
  if (timer) {
    removeTimerClasses(timer);
  }

  removeCottonCandyStyle();

  // Remove the old shield class.
  const classesToKeep = new Set(['mousehuntHud-shield', 'golden']);
  const classes = [...shieldEl.classList];
  classes.forEach((className) => {
    if (!classesToKeep.has(className)) {
      shieldEl.classList.remove(className);
    }
  });

  // Get the new shield.
  let shield = getSetting('custom-shield-0', 'default');
  if ('default' === shield) {
    shieldEl.classList.add('default', 'default-fancy');
    return;
  }

  // If it's cotton candy, add the style, otherwise remove it.
  if (shield === 'color-cotton-candy') {
    makeElement('style', 'mh-improved-cotton-candy-style', cottonCandyStyles, document.head);

    shield = 'color-pink-timer';
  }

  if (shield.startsWith('color-')) {
    shieldEl.classList.add('default');
    shieldEl.classList.add('color');
  }

  if (shield.endsWith('-timer')) {
    shield = shield.replace('-timer', '');
    timer?.classList.add(shield);
  }

  // if its the alt, also add the non-alt class.
  if (shield.endsWith('-alt')) {
    const altClass = shield.replace('-alt', '');
    shieldEl.classList.add(altClass, 'alt');
  }

  if (shield.includes('title')) {
    shieldEl.classList.add('title');
    // Titles with a space (like "grand duke") have no space in their class name.
    shield = 'title' === shield ? getUserTitle().replaceAll(' ', '') : shield;
  }

  shieldEl.classList.add('mhui-custom-shield');
  addClass(shieldEl, shield);
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-shield');

  if ('default' !== getSetting('custom-shield-0', 'default')) {
    changeShield();
  }

  onEvent('mh-improved-settings-changed', ({ key }) => {
    if ('custom-shield-0' === key) {
      changeShield();
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-shield',
  type: 'personalization',
  alwaysLoad: true,
  load: init,
  settings,
};
