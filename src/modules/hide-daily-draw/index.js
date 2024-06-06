import {
  addStyles,
  doRequest,
  onEvent,
  onRequest,
  setMultipleTimeout
} from '@utils';

import styles from './styles.css';

let _togglePopup;

/**
 * Replace the inbox open function.
 */
const replaceInboxOpen = () => {
  if (! messenger || ! messenger?.UI?.notification?.togglePopup) {
    return;
  }

  if (! _togglePopup) {
    _togglePopup = messenger.UI.notification.togglePopup;
  }

  /**
   * Show the notification popup.
   */
  messenger.UI.notification.togglePopup = () => {
    messenger.UI.notification.showPopup();

    messenger.UI.notification.setActiveTab('general');
    messenger.UI.notification.showTab('general');
    onEvent('ajax_response', () => {
      setMultipleTimeout(() => {
        messenger.UI.notification.showTab('general');
      }, [10, 100]);
    }, true);
  };
};

let isSelfRequest = false;

/**
 * Remove the daily draw notifications.
 *
 * @param {Object} data The data from the request.
 */
const removeDailyDrawNotifications = async (data) => {
  if (isSelfRequest) {
    return;
  }

  if (! data?.messageData || ! data?.messageData?.notification) {
    return;
  }

  const messageBar = document.querySelector('#hgbar_messages');
  if (! messageBar) {
    return;
  }

  if (! messageBar.classList.contains('new')) {
    return;
  }

  const displayedNotificationsEl = messageBar.querySelector('.mousehuntHeaderView-menu-notification');
  if (! displayedNotificationsEl) {
    return;
  }

  const displayedNotifications = Number.parseInt(displayedNotificationsEl.innerText, 10);

  if (displayedNotifications <= 0) {
    return;
  }

  const notification = data.messageData.notification || {};
  const newNotifications = notification?.messageCount || 0;
  if (newNotifications <= 0) {
    return;
  }

  isSelfRequest = true;
  const notificationData = await doRequest('managers/ajax/users/messages.php', {
    action: 'fetch_messages',
    'message_types[]': 'notification',
  });
  isSelfRequest = false;

  let notificationsToSubtract = 0;

  notificationData?.messageData?.notification?.messages.forEach((message) => {
    if (! message?.isNew) {
      return;
    }

    if ('Daily Draw' === message?.messageData?.tab) {
      notificationsToSubtract++;
    }
  });

  if (notificationsToSubtract <= 0) {
    return;
  }

  const newDisplayedNotifications = displayedNotifications - notificationsToSubtract;
  if (newDisplayedNotifications <= 0) {
    messageBar.classList.remove('new');
  }

  displayedNotificationsEl.innerText = newDisplayedNotifications;
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'hide-daily-draw');

  if ('undefined' !== typeof messenger) {
    replaceInboxOpen();
  }

  // this clears the notification count when it does its self request.
  setTimeout(removeDailyDrawNotifications, 1000);
  onRequest('*', removeDailyDrawNotifications);
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-daily-draw',
  name: 'Hide Daily Draw',
  type: 'element-hiding',
  default: false,
  description: 'Hides the Daily Draw inbox tab and notifications.',
  load: init,
};
