import {
  addBodyClass,
  addStyles,
  getCurrentPage,
  getSetting,
  makeElement,
  onNavigation,
  onRequest,
  onTravel,
  removeBodyClass,
  saveSetting
} from '@utils';

import styles from './styles.css';

const getUpdateLink = (version) => {
  return `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${version}`;
};

const addBanner = (hasNewSettings = false) => {
  // Only show the banner once.
  if (mhImprovedVersion === getSetting('has-seen-update-banner', '')) {
    if (hasNewSettings) {
      removeBodyClass('mh-improved-has-update');
    }

    return;
  }

  // Also add a class to the body so the settings page can show a "new" badge if there are new settings.
  if (hasNewSettings) {
    addBodyClass('mh-improved-has-update');
  }

  // Don't show except on the camp page.
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const banner = document.querySelector('.campPage-tabs .campPage-banner');

  const bannerWrapper = makeElement('div', ['mhui-update-banner', 'banner-fade']);
  const bannerContent = makeElement('div', 'mhui-update-banner-content');
  makeElement('div', 'mhui-update-banner-text', `Welcome to MouseHunt Improved v${mhImprovedVersion}!`, bannerContent);

  const buttonWrapper = makeElement('div', 'mhui-update-banner-buttons', '');
  const button = makeElement('a', ['mhui-update-banner-button', 'mousehuntActionButton', 'small', 'lightBlue']);
  makeElement('span', '', 'See what\'s new', button);
  button.href = getUpdateLink(mhImprovedVersion);
  button.target = '_blank';
  buttonWrapper.append(button);

  const closeButton = makeElement('a', ['mhui-update-banner-close', 'mousehuntActionButton', 'small', 'cancel']);
  makeElement('span', '', 'Dismiss', closeButton);
  closeButton.addEventListener('click', (e) => {
    e.preventDefault();

    bannerWrapper.classList.add('banner-fade-out');
    saveSetting('has-seen-update-banner', mhImprovedVersion);

    removeBodyClass('mh-improved-has-update');

    setTimeout(() => {
      bannerWrapper.remove();
    }, 1000);
  });

  buttonWrapper.append(closeButton);

  bannerContent.append(buttonWrapper);
  bannerWrapper.append(bannerContent);

  banner.append(bannerWrapper);

  banner.classList.remove('hidden');

  setTimeout(() => {
    bannerWrapper.classList.add('banner-fade-in');
  }, 1000);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  addBanner(true); // True if there are new settings, otherwise false.
};

export default {
  id: 'update-notifications',
  type: 'required',
  load: init,
};
