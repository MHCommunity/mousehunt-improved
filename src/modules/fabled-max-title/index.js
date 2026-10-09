import {
  addBodyClass,
  addStyles,
  getFlag,
  getSetting,
  isModuleEnabled,
  isUserTitleAtLeast,
  makeElement,
  onEvent,
  onModuleToggle,
  onNavigation,
  onTurn,
  removeBodyClass,
} from '@utils';

import settings from './settings';
import titles from './random-titles';

import progressBarStyles from './progress-bar.css';
import randomTitleStyles from './random-title.css';

const moduleId = 'fabled-max-title';
const progressBarClass = 'mh-max-title-progress-bar';

let lastTitle = null;
let originalTitle = null;

/**
 * Check if the hunter has the max title.
 *
 * @return {boolean} Whether the hunter is Fabled.
 */
const isFabled = () => isUserTitleAtLeast('fabled') || getFlag('fake-fabled');

/**
 * Get the max title element, remembering the game's text the first time.
 *
 * @return {HTMLElement|null} The max title element.
 */
const getTitleElement = () => {
  const title = document.querySelector('.mousehuntHud-userStat-maxTitle');
  if (title && null === originalTitle) {
    originalTitle = title.textContent;
  }

  return title;
};

/**
 * Show the custom max title text.
 */
const showCustomTitle = () => {
  const title = getTitleElement();
  const customTitle = String(getSetting(`${moduleId}.custom-text`, 'MAX TITLE')).trim();
  if (title) {
    title.textContent = customTitle || originalTitle;
  }
};

/**
 * Show a random max title, different from the last one.
 */
const showRandomTitle = () => {
  const title = getTitleElement();
  if (!title) {
    return;
  }

  let randomTitle = titles[Math.floor(Math.random() * titles.length)];
  while (randomTitle === lastTitle) {
    randomTitle = titles[Math.floor(Math.random() * titles.length)];
  }
  lastTitle = randomTitle;

  let titleText = title.querySelector('.mh-improved-random-title');
  if (!titleText) {
    title.innerText = '';
    titleText = makeElement('span', 'mh-improved-random-title', randomTitle);
    title.append(titleText);
    return;
  }

  titleText.classList.add('mh-improved-random-title-fading');
  setTimeout(() => {
    titleText.innerText = randomTitle;
    titleText.classList.remove('mh-improved-random-title-fading');
  }, 350);
};

/**
 * Put the game's max title back.
 */
const restoreTitle = () => {
  removeBodyClass(progressBarClass);

  const title = getTitleElement();
  if (title) {
    title.textContent = originalTitle;
  }
};

/**
 * Show the chosen max title style.
 */
const applyTitle = () => {
  const style = getSetting(`${moduleId}.style-0`, 'custom');

  if ('progress-bar' === style) {
    restoreTitle();
    addBodyClass(progressBarClass, true);
    return;
  }

  removeBodyClass(progressBarClass);
  if ('random' === style) {
    showRandomTitle();
  } else {
    showCustomTitle();
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  if (!isFabled()) {
    return;
  }

  addStyles([progressBarStyles, randomTitleStyles], moduleId);

  applyTitle();
  onNavigation(applyTitle);
  onTurn(applyTitle);

  onModuleToggle(moduleId, {
    enable: applyTitle,
    disable: restoreTitle,
  });

  onEvent('mh-improved-settings-changed', ({ key }) => {
    if (key?.startsWith(`${moduleId}.`) && isModuleEnabled(moduleId)) {
      applyTitle();
    }
  });
};

export default {
  id: moduleId,
  name: 'Max Title',
  description: 'Change what the HUD shows in place of the title progress bar.',
  type: 'personalization',
  badge: 'Fabled Only',
  default: false,
  liveToggle: true,
  showIf: isFabled,
  load: init,
  settings,
};
