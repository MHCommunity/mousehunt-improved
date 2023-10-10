import { addUIStyles, getMhuiSetting, getFlag } from '../utils';
import styles from './styles.css';

const addClass = (el, shieldClass) => {
  const classToAdd = shieldClass.replace('.', ' ');

  classToAdd.split(' ').forEach((className) => {
    el.classList.add(className);
  });
};

const changeShield = () => {
  const shieldEl = document.querySelector('.mousehuntHud-shield');
  if (! shieldEl) {
    return;
  }

  // remove all the classes from the shield exceptfor .mousehuntHud-shield and .golden.
  shieldEl.classList.forEach((className) => {
    if (className !== 'mousehuntHud-shield' && className !== 'golden') {
      shieldEl.classList.remove(className);
    }
  });

  const timer = document.querySelector('.huntersHornView__timer--default');
  if (timer) {
    // remove all the classes that start with 'color-' from the timer.
    timer.classList.forEach((className) => {
      if (className.startsWith('color-')) {
        timer.classList.remove(className);
      }
    });
  }

  let shield = getMhuiSetting('custom-shield-0', 'default');
  if ('default' === shield) {
    shieldEl.classList.add('default');
    return;
  }

  if (shield.startsWith('color-')) {
    shieldEl.classList.add('default');
  }

  if (shield.endsWith('-timer')) {
    shield = shield.replace('-timer', '');
    if (timer) {
      timer.classList.add(shield);
    }
  }

  if (shield.endsWith('-alt')) {
    // if its the alt, also add the non-alt class.
    shieldEl.classList.add(shield.replace('-alt', ''), 'alt');
  }

  if (shield.includes('title')) {
    shieldEl.classList.add('title');

    if ('title' === shield) {
      shield = getTitle();
    }
  }

  shieldEl.classList.add('mhui-custom-shield');
  addClass(shieldEl, shield);

  if (getFlag('background-has-shield-color')) {
    const colors = {
      'color-blue': 0,
      'color-cyan': 312,
      'color-green': 266,
      'color-pink': 80,
      'color-purple': 51,
      'color-red': 146,
    };

    const leftColumn = document.querySelector('.pageFrameView-column.left');
    const rightColumn = document.querySelector('.pageFrameView-column.right');
    if (! leftColumn || ! rightColumn) {
      return;
    }

    leftColumn.style.filter = `hue-rotate(${colors[shield]}deg)`;
    rightColumn.style.filter = `hue-rotate(${colors[shield]}deg)`;

    if ('color-faded' === shield) {
      leftColumn.style.filter = 'sepia(1)';
      rightColumn.style.filter = 'sepia(1)';
    }
  }
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

export default () => {
  addUIStyles(styles);

  changeShield();

  onNavigation(() => {
    const input = document.querySelector('#mousehunt-improved-settings-feature-modules-custom-shield select');
    if (! input) {
      return;
    }

    input.addEventListener('change', () => {
      changeShield();
    });
  }, {
    page: 'preferences',
    onLoad: true,
  });
};
