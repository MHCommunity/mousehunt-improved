import {
  addBodyClass,
  addStyles,
  debuglog,
  getCurrentPage,
  getCurrentTab,
  getFlag,
  getGlobal,
  getSetting,
  makeElement,
  onNavigation,
  removeBodyClass,
  saveSetting
} from '@utils';

import styles from './styles.css';

/**
 * Get the link to a version's release notes.
 *
 * @param {string} version The version to get the link for.
 *
 * @return {string} The link to the release notes.
 */
const getUpdateLink = (version) => {
  return `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${version}`;
};

/**
 * Check if the user has seen the update banner.
 *
 * @return {boolean} True if the user has seen the banner, false otherwise.
 */
const hasSeenBanner = () => {
  return mhImprovedVersion === getSetting('updates.banner', '');
};

/**
 * Add the update banner.
 *
 * @param {boolean} hasNewSettings Whether there are new settings.
 */
const addBanner = (hasNewSettings = false) => {
  // Only show the banner once.
  if (hasSeenBanner()) {
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
    saveSetting('updates.banner', mhImprovedVersion);

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
  addStyles(styles, 'update-notifications');

  if (getGlobal('mh-improved-updating')) {
    return;
  }

  addBanner(true); // True if there are new settings, otherwise false.
};

export default {
  id: 'update-notifications',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
