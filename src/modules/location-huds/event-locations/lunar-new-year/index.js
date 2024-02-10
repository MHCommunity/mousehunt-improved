import {
  addStyles,
  getCurrentPage,
  makeElement,
  onEvent,
  onRequest
} from '@utils';

import styles from './styles.css';

let startY, initialTranslateY;

const dragMapPopup = async () => {
  const map = document.querySelector('.lunarNewYearCampPopupContainer .lunarNewYearCampHUD-window-background');
  if (! map) {
    return;
  }

  dragMap({ map, maxHeight: 2300 });
};

const dragMapCamp = async () => {
  const map = document.querySelector('.lunarNewYearCampHUD-window .lunarNewYearCampHUD-window-background');
  if (! map) {
    return;
  }

  dragMap({ map, maxHeight: 1881 });
};

const dragMap = async (args) => {
  const { map, maxHeight } = args;

  if (! map) {
    return;
  }

  const onDrag = (event) => {
    const deltaY = event.clientY - startY;
    let newTranslateY = initialTranslateY + deltaY;

    if (newTranslateY < 0) {
      newTranslateY = 0;
    } else if (newTranslateY > maxHeight) {
      newTranslateY = maxHeight;
    }

    map.style.transform = `translateY(${newTranslateY}px)`;
  };

  map.addEventListener('mousedown', (event) => {
    startY = event.clientY;
    const style = window.getComputedStyle(map);
    const matrix = new WebKitCSSMatrix(style.transform);
    initialTranslateY = matrix.m42;

    map.style.transition = 'none';

    map.addEventListener('mousemove', onDrag);
  });

  map.addEventListener('mouseup', () => {
    map.removeEventListener('mousemove', onDrag);
  });

  map.addEventListener('wheel', (event) => {
    event.preventDefault();

    map.style.transition = 'none';

    const style = window.getComputedStyle(map);
    const matrix = new WebKitCSSMatrix(style.transform);
    const currentTranslateY = matrix.m42;
    let newTranslateY = currentTranslateY - event.deltaY;

    if (newTranslateY < 0) {
      newTranslateY = 0;
    } else if (newTranslateY > maxHeight) {
      newTranslateY = maxHeight;
    }

    map.style.transform = `translateY(${newTranslateY}px)`;
  });

  map.addEventListener('mouseleave', () => {
    map.style.transition = 'transform 1s ease-in-out';
  });
};

const triggerFireworks = () => {
  const existing = document.querySelector('.launch-the-fireworks-please');
  if (existing) {
    return;
  }

  const fireworks = document.querySelector('.lunarNewYearCampHUD-container .lunarNewYearCampHUD-window-fireworksContainer');
  if (! fireworks) {
    return;
  }

  const statsContainer = document.querySelector('.lunarNewYearCampHUD-container .lunarNewYearCampHUD-statsContainer');
  if (! statsContainer) {
    return;
  }

  const launchButton = makeElement('div', 'launch-the-fireworks-please', '');
  statsContainer.append(launchButton);

  let isAnimating = false;
  launchButton.addEventListener('click', () => {
    launchButton.classList.add('launched');
    fireworks.classList.add('launch-the-fireworks');
    if (isAnimating) {
      return;
    }
    isAnimating = true;

    setTimeout(() => {
      launchButton.classList.remove('launched');
      fireworks.classList.remove('launch-the-fireworks');
      isAnimating = false;
    }, 5 * 1000);
  });
};

/**
 * Always active.
 */
const lunarNewYearGlobal = async () => {
  addStyles(styles, 'location-hud-events-lunar-new-year');

  onRequest('events/lunar_new_year.php', dragMapPopup);

  if ('camp' === getCurrentPage()) {
    dragMapCamp();
    triggerFireworks();
  }

  onEvent('camp_quest_hud_view_initialize', () => {
    dragMapCamp();
    triggerFireworks();
  });
};

/**
 * Only active at the event location.
 */
const lunarNewYearLocation = async () => {
  // no-op.
};

export {
  lunarNewYearGlobal,
  lunarNewYearLocation
};
