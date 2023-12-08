import { getSetting, saveSetting } from '@/utils';

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
 */
/**
 * Initialize the module.
 */
export default () => {
  const link = `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${mhImprovedVersion}`;

  const { date, hasRead } = getReadUpdateNotificationTime(mhImprovedVersion);

  // Check to see if the date is older than 1 week and if so, don't show the notification.
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (new Date(date) < oneWeekAgo) {
    return;
  }

  const m = new MessengerUINotification();
  m.addMessage({
    messageId: `mhui-update-notification-${mhImprovedVersion}`,
    messageType: 'news',
    messageData: {
      text: `<img src="https://i.mouse.rip/mh-improved/icon-64.png" class="item" alt="MouseHunt Improved icon">MH Improved has been updated to v${mhImprovedVersion}! <a href="${link}">Check out the changelog</a> for more details.`,
      href: link,
      cssClass: 'mhui-notification',
    },
    messageDate: date,
    isNew: ! hasRead,
  });
};
