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

/**
 * Get the last time the user read the update notification.
 *
 * @param {string} version The version of MH Improved.
 *
 * @return {Object} The date and if the user has read the notification.
 */
const getReadUpdateNotificationTime = (version) => {
  let date = getSettingDirect(version, false, 'mh-improved-update-notifications');
  let hasRead = true;

  if (! date) {
    hasRead = false;

    date = getDate();
    saveSettingDirect(version, date, 'mh-improved-update-notifications');
  }

  return {
    date,
    hasRead,
  };
};

const getUpdateType = (version) => {
  const versionSplit = version.split('.');
  if (versionSplit.length >= 2 && versionSplit[2] !== '0') {
    return 'patch';
  }

  if (versionSplit[1] !== '0') {
    return 'major';
  }

  return 'minor';
};

const getUpdateLink = (version) => {
  return `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${version}`;
};

/**
 * Show a notification to the user that MH Improved has been updated.
 *
 * @param {any}     m       The MessengerUINotification object.
 * @param {string}  version The version of MH Improved.
 * @param {boolean} isPatch If the update is a patch update.
 */
const showUpdateNotification = (m, version, isPatch = false) => {
  const { date, hasRead } = getReadUpdateNotificationTime(version);

  // Check to see if the date is older than 1 week and if so, don't show the notification.
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  if (new Date(date) < threeWeeksAgo) {
    return;
  }

  const link = getUpdateLink(version);
  const updateText = `MouseHunt Improved has been updated to v${version}!`;

  m.addMessage({
    messageId: `mhui-update-notification-${version}`,
    messageType: 'news',
    messageData: {
      text: `<img src="https://i.mouse.rip/mh-improved/icon-64.png" class="item" alt="MouseHunt Improved icon">${updateText}<a href="${link}">${isPatch ? 'View the changelog' : 'Read the release notes'}</a>.`,
      href: link,
      cssClass: `mhui-notification ${isPatch ? 'mhui-notification-minor' : 'mhui-notification-major'}`,
    },
    messageDate: date,
    isNew: ! hasRead,
  });
};

const addBanner = (hasNewSettings = false) => {
  if (getUpdateType(mhImprovedVersion) === 'patch') {
    return;
  }

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

const addToInbox = () => {
  const m = new MessengerUINotification();

  // If our version is somehow not 3 parts, just use the full version.
  const version = mhImprovedVersion.split('.');
  if (version.length !== 3) {
    showUpdateNotification(m, mhImprovedVersion);
    return;
  }

  // If it's a major update, show the notification.
  if (version[2] === '0') {
    showUpdateNotification(m, mhImprovedVersion);
  } else {
    showUpdateNotification(m, `${version[0]}.${version[1]}.0`);
    showUpdateNotification(m, mhImprovedVersion, true);
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  addToInbox();
  addBanner(true); // True if there are new settings, otherwise false.
};

export default {
  id: 'update-notifications',
  type: 'required',
  load: init,
};
