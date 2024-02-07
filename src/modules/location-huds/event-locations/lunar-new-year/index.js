import { addStyles, onRequest } from '@utils';

import styles from './styles.css';

let startY, initialTranslateY;

const dragMap = async () => {
  const map = document.querySelector('.lunarNewYearCampPopupContainer .lunarNewYearCampHUD-window-background');
  if (! map) {
    return;
  }

  const onDrag = (event) => {
    const deltaY = event.clientY - startY;
    let newTranslateY = initialTranslateY + deltaY;

    if (newTranslateY < 0) {
      newTranslateY = 0;
    } else if (newTranslateY > 2300) {
      newTranslateY = 2300;
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
    let currentTranslateY = matrix.m42;
    let newTranslateY = currentTranslateY - event.deltaY;

    if (newTranslateY < 0) {
      newTranslateY = 0;
    } else if (newTranslateY > 2300) {
      newTranslateY = 2300;
    }

    map.style.transform = `translateY(${newTranslateY}px)`;
  });

  map.addEventListener('mouseleave', () => {
    map.style.transition = 'transform 1s ease-in-out';
  });
};

// Always active.
const lunarNewYearGlobal = async () => {
  addStyles(styles, 'location-hud-events-lunar-new-year');

  onRequest(dragMap, 'managers/ajax/events/lunar_new_year.php');
};

// Only active at the locations.
const lunarNewYearLocation = async () => {
  // no-op.
};

export {
  lunarNewYearGlobal,
  lunarNewYearLocation
};
