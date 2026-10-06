import { addBodyClass, addStyles, getSetting, isModuleEnabled, onEvent, onModuleToggle, removeBodyClass } from '@utils';

import settings from './settings';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const delays = ['menus', 'tooltips'];

/**
 * Add a body class for each delay that's on, which the styles use to add the delay.
 */
const updateBodyClasses = () => {
  for (const delay of delays) {
    const className = `mhui-delay-${delay}`;
    if (isModuleEnabled('hover-delays') && getSetting(`hover-delays.${delay}`, true)) {
      addBodyClass(className, true);
    } else if (document.body.classList.contains(className)) {
      removeBodyClass(className);
    }
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'hover-delays');
  updateBodyClasses();

  onEvent('mh-improved-settings-changed', ({ key }) => {
    if (key?.startsWith('hover-delays.')) {
      updateBodyClasses();
    }
  });

  onModuleToggle('hover-delays', {
    enable: updateBodyClasses,
    disable: updateBodyClasses,
  });

  // Show tooltips right away while Shift is held.
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey) {
      document.body.classList.add('no-delayed-tooltips');
    }
  });

  document.addEventListener('keyup', (e) => {
    if (!e.shiftKey) {
      document.body.classList.remove('no-delayed-tooltips');
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'hover-delays',
  name: 'Hover Delays',
  type: 'interface',
  default: true,
  description: 'Add a short delay before menus and tooltips open, so they don’t pop up as you move the mouse past them.',
  liveToggle: true,
  load: init,
  settings,
};
