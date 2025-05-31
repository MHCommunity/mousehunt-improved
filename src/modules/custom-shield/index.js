import {
  addSettingPreview,
  addStyles,
  getSetting,
  getUserTitle,
  makeElement,
  onNavigation,
  setMultipleTimeout
} from '@utils';

import settings from './settings';
import styles from './styles.css';

import cottonCandyStyles from './cotton-candy.css';

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

/**
 * Add a class from an element.
 *
 * @param {Element} el          The element to add the class to.
 * @param {string}  shieldClass The class to add.
 */
const addClass = (el, shieldClass) => {
  doClass(el, shieldClass, 'add');
};

let lastShield = '';

/**
 * Change the shield based on the user's preference.
 */
const changeShield = () => {
  const shieldEl = document.querySelector('.mousehuntHud-shield');
  if (! shieldEl) {
    return;
  }

  let timer = document.querySelector('.huntersHornView__timer--default');
  if (! timer) {
    timer = document.querySelector('.huntersHornView__timer--legacy');
    if (! timer) {
      return;
    }
  }

  // Remove the old shield class.
  const classesToKeep = new Set(['mousehuntHud-shield', 'golden']);
  const classes = [...shieldEl.classList];
  classes.forEach((className) => {
    if (! classesToKeep.has(className)) {
      shieldEl.classList.remove(className);
    }
  });

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

let inputListener = null;
/**
 * Listen for preference changes to update the shield.
 */
const watchForPreferenceChanges = () => {
  const input = document.querySelector('#mousehunt-improved-settings-design-custom-shield select');
  if (! input) {
    return;
  }

  if (inputListener) {
    input.removeEventListener('change', inputListener);
  }

  inputListener = input.addEventListener('change', () => {
    changeShield();
  });
};

const shieldPreview = (shield) => {
  const shieldClass = shield.id
    .replaceAll('color-', ' default color-')
    .replaceAll('-alt', ' alt')
    .replaceAll('.', ' ');

  return `<div class="mh-improved-custom-shield-item-preview ${shield.id}"><a class="mousehuntHud-shield golden ${shieldClass}"></a>
</div>`;
};

const getShieldSettingsValues = async () => {
  const settingsValues = await settings();
  const shields = settingsValues[0].settings.options.reduce((acc, option) => {
    if (option.options && Array.isArray(option.options)) {
      return [...acc, ...option.options];
    }

    if (option.value && option.name) {
      return [...acc, option];
    }

    return acc;
  }, []).filter((option) => {
    if (! option?.value || 'title' === option.value || 'default-normal' === option.value || 'color-cotton-candy' === option.value) {
      return false;
    }

    return ! option.value.includes('-timer');
  }).map((option) => {
    return {
      id: option.value,
      name: option.name.replaceAll('(LGS Required)', ''),
    };
  });

  return shields;
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-shield');

  lastShield = getSetting('custom-shield-0', 'default');

  changeShield();

  onNavigation(() => {
    setMultipleTimeout(watchForPreferenceChanges, [100, 1000, 2000, 5000]);

    getShieldSettingsValues().then((shields) => {
      addSettingPreview({
        id: 'custom-shield',
        selector: '.mh-improved-custom-shield-preview',
        inputSelector: '#mousehunt-improved-settings-design-custom-shield select',
        preview: false,
        items: shields,
        itemPreviewCallback: shieldPreview,
      });
    }).catch(() => {
      /* Failed to load shield settings values */
    });
  }, {
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
