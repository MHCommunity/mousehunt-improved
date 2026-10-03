import { addStyles, getSetting, onEvent, onNavigation } from '@utils';

import gradients from '@data/backgrounds.json';

import settings from './settings';
import styles from './styles.css';

const campBackgroundClasses = [
  'background-black',
  'background-blue',
  'background-blueprint',
  'background-cyan',
  'background-faded',
  'background-green',
  'background-marble',
  'background-pink',
  'background-purple',
  'background-red',
  'background-white',
  'background-wood',
];

const addCampBackground = () => {
  const camp = document.querySelector('#mousehuntContainer');
  if (!camp) {
    return;
  }

  // The game resets the container's classes on each page change but not its inline style, so clear
  // any gradient on every page, not just camp.
  camp.classList.remove(...campBackgroundClasses);
  camp.style.removeProperty('background');

  if (!camp.classList.contains('PageCamp')) {
    return;
  }

  const background = getSetting('custom-camp-background-0', 'background-wood');
  if ('default' === background) {
    return;
  }

  if (background.startsWith('background-')) {
    camp.classList.add(background);
    return;
  }

  if (!gradients) {
    return;
  }

  const gradient = gradients.find((g) => g.id === background);
  if (gradient) {
    camp.style.background = gradient.css;
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'custom-camp-background');

  onNavigation(addCampBackground);

  // The camp isn't rendered while the preferences page is open, so this only takes effect for
  // someone changing the setting from the camp page itself.
  onEvent('mh-improved-settings-changed', ({ key }) => {
    if ('custom-camp-background-0' === key) {
      addCampBackground();
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-camp-background',
  type: 'appearance',
  alwaysLoad: true,
  load: init,
  settings,
};
