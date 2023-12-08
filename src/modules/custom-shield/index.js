import { addUIStyles, getMhuiSetting, onNavigation } from '@/utils';

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

  const backgroundLeft = document.querySelector('.pageFrameView-column.left');
  if (backgroundLeft) {
    // remove all the classes that start with 'color-' from the timer.
    backgroundLeft.classList.forEach((className) => {
      if (className.startsWith('color-')) {
        backgroundLeft.classList.remove(className);
      }
    });
  }

  const backgroundRight = document.querySelector('.pageFrameView-column.right');
  if (backgroundRight) {
    // remove all the classes that start with 'color-' from the timer.
    backgroundRight.classList.forEach((className) => {
      if (className.startsWith('color-')) {
        backgroundRight.classList.remove(className);
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

    if (shield === 'color-cotton-candy') {
      addUIStyles(`.huntersHornView__backdrop {
        filter: hue-rotate(180deg);
        opacity: 1;
        transition: none;
      }

      .mousehuntHud-menu.default > ul li a {
        filter: hue-rotate(337deg);
        backdrop-filter: hue-rotate(199deg);
      }

      .mousehuntHud-menu ul li.active .mousehuntHud-menu-item.root,
      .mousehuntHud-menu ul li:hover .mousehuntHud-menu-item.root {
        background: url(https://www.mousehuntgame.com/images/ui/hud/menu/menu_seperator.png?asset_cache_version=2) 100% 0 no-repeat;
        filter: hue-rotate(328deg);
        backdrop-filter: hue-rotate(292deg);
      }`);

      shield = 'color-pink-timer-background';
    }

    if (shield.endsWith('-timer-background')) {
      shield = shield.replace('-timer-background', '');
      backgroundLeft.classList.add(shield);
      backgroundRight.classList.add(shield);
      shieldEl.classList.add(shield);
      timer.classList.add(shield);
    }

    if (shield.endsWith('-background')) {
      shield = shield.replace('-background', '');
      backgroundLeft.classList.add(shield);
      backgroundRight.classList.add(shield);
      shieldEl.classList.add(shield);
    }

    if (shield.endsWith('-timer')) {
      shield = shield.replace('-timer', '');
      if (timer) {
        timer.classList.add(shield);
      }
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

/**
 * Initialize the module.
 */
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
