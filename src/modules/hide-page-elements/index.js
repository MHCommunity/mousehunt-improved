import { addBodyClass, addStyles, getSetting, isModuleEnabled, onEvent, onModuleToggle, removeBodyClass } from '@utils';

import elements from './elements';
import hideDailyDraw from './daily-draw';
import hideDailyRewardPopup from './daily-reward-popup';
import settings from './settings';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Check whether a page element is being hidden.
 *
 * @param {string} id The element id.
 *
 * @return {boolean} Whether it's hidden.
 */
const isHidden = (id) => {
  const element = elements.find((item) => item.id === id);

  return isModuleEnabled('hide-page-elements') && Boolean(getSetting(`hide-page-elements.hide-${id}`, element?.default ?? false));
};

/**
 * Add a body class for each hidden element, which the styles use to hide it.
 */
const updateBodyClasses = () => {
  for (const element of elements) {
    if (isHidden(element.id)) {
      addBodyClass(`mhui-hide-${element.id}`, true);
    } else if (document.body.classList.contains(`mhui-hide-${element.id}`)) {
      removeBodyClass(`mhui-hide-${element.id}`);
    }
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'hide-page-elements');
  updateBodyClasses();

  onEvent('mh-improved-settings-changed', ({ key }) => {
    if (key?.startsWith('hide-page-elements.hide-')) {
      updateBodyClasses();
    }
  });

  onModuleToggle('hide-page-elements', {
    enable: updateBodyClasses,
    disable: updateBodyClasses,
  });

  if ('undefined' !== typeof SocialFramework && 'function' === typeof SocialFramework.isFriendStreamPostsEnabled) {
    const original = SocialFramework.isFriendStreamPostsEnabled;
    SocialFramework.isFriendStreamPostsEnabled = function (...args) {
      return isHidden('share') ? false : original.apply(this, args);
    };
  }

  hideDailyDraw(() => isHidden('daily-draw'));
  hideDailyRewardPopup(() => isHidden('daily-reward-popup'));
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-page-elements',
  name: 'Hide page elements',
  type: 'personalization',
  default: true,
  description: 'Hide parts of the page you don’t use, like ads, share buttons, and the news ticker.',
  liveToggle: true,
  load: init,
  settings,
};
