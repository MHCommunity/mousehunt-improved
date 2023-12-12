import { addUIStyles, getSetting, saveSetting } from '@/utils';

import styles from './styles.css';

/**
 * Get the last time the user read the update notification.
 *
 * @param {string} version The version of MH Improved.
 *
 * @return {Object} The date and if the user has read the notification.
 */
const getReadUpdateNotificationTime = (version) => {
  let date = getSetting(version, false, 'mh-improved-update-notifications');
  let hasRead = true;

  if (! date) {
    hasRead = false;

    date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    saveSetting(version, date, 'mh-improved-update-notifications');
  }

  return {
    date,
    hasRead,
  };
};

/**
 * Show a notification to the user that MH Improved has been updated.
 *
 * @param {any}     m       The MessengerUINotification object.
 * @param {string}  version The version of MH Improved.
 * @param {boolean} isPatch If the update is a patch update.
 */
const showUpdateNotification = (m, version, isPatch = false) => {
  const link = `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${version}`;

  const { date, hasRead } = getReadUpdateNotificationTime(version);

  // Check to see if the date is older than 1 week and if so, don't show the notification.
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  if (new Date(date) < threeWeeksAgo) {
    return;
  }

  m.addMessage({
    messageId: `mhui-update-notification-${version}`,
    messageType: 'news',
    messageData: {
      text: `<img src="https://i.mouse.rip/mh-improved/icon-64.png" class="item" alt="MouseHunt Improved icon">MouseHunt Improved has been updated to v${version}! <a href="${link}">${isPatch ? 'View the changelog' : 'Read the release notes'}</a>.`,
      href: link,
      cssClass: `mhui-notification ${isPatch ? 'mhui-notification-minor' : 'mhui-notification-major'}`,
    },
    messageDate: date,
    isNew: ! hasRead,
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addUIStyles(styles);

  const version = mhImprovedVersion.split('.');
  const m = new MessengerUINotification();

  // If our version is somehow not 3 parts, just use the full version.
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

export default {
  id: 'update-notifications',
  type: 'required',
  load: init,
};
