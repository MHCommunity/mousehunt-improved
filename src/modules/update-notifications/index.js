import {
  addBodyClass,
  addStyles,
  getCurrentPage,
  getSettingDirect,
  makeElement,
  removeBodyClass,
  saveSettingDirect
} from '@utils';

import styles from './styles.css';

const getDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getUpdateLink = (version) => {
  return `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${version}`;
};

const addBanner = (hasNewSettings = false) => {
  // Only show the banner once.
  if (getSettingDirect(`${mhImprovedVersion}-banner`, false, 'mh-improved-update-notifications')) {
    if (hasNewSettings) {
      removeBodyClass('mh-improved-has-update');
    }

    return;
  }

  // Also add a class to the body so the settings page can show a "new" badge if there are new settings.
  addBodyClass('mh-improved-has-update');

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
    saveSettingDirect(`${mhImprovedVersion}-banner`, getDate(), 'mh-improved-update-notifications');

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

  addBanner(false); // True if there are new settings, otherwise false.
};

export default {
  id: 'update-notifications',
  type: 'required',
  load: init,
};
