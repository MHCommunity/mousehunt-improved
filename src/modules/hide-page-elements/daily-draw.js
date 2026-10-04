import { doRequest, onEvent, onRequest, setMultipleTimeout } from '@utils';

/**
 * Replace the inbox open function.
 *
 * @param {Function} isHidden Whether the Daily Draw is currently hidden.
 */
const replaceInboxOpen = (isHidden) => {
  if (!messenger || !messenger?.UI?.notification?.togglePopup) {
    return;
  }

  const original = messenger.UI.notification.togglePopup;

  /**
   * Show the notification popup.
   *
   * @param {...*} args Arguments passed to the existing inbox toggle.
   *
   * @return {*} The existing inbox toggle's return value.
   */
  messenger.UI.notification.togglePopup = function (...args) {
    // Preserve wrappers installed by other inbox modules, such as Gift Links.
    // Hiding the Daily Draw should only change the selected tab, not replace
    // the rest of the inbox-opening lifecycle.
    const result = original.apply(this, args);
    if (!isHidden()) {
      return result;
    }

    messenger.UI.notification.showPopup();

    messenger.UI.notification.setActiveTab('general');
    messenger.UI.notification.showTab('general');
    onEvent(
      'ajax_response',
      () => {
        setMultipleTimeout(() => {
          messenger.UI.notification.showTab('general');
        }, [10, 100]);
      },
      true
    );

    return result;
  };
};

let isSelfRequest = false;
let lastRequest;
/**
 * Remove the daily draw notifications.
 *
 * @param {Object}   data     The data from the request.
 * @param {Function} isHidden Whether the Daily Draw is currently hidden.
 */
const removeDailyDrawNotifications = async (data, isHidden) => {
  if (isSelfRequest || !isHidden()) {
    return;
  }

  // if the last request was less than 2 seconds ago, ignore it.
  if (lastRequest && Date.now() - lastRequest < 2000) {
    return;
  }

  if (!data?.messageData || !data?.messageData?.notification) {
    return;
  }

  lastRequest = Date.now();

  const messageBar = document.querySelector('#hgbar_messages');
  if (!messageBar) {
    return;
  }

  if (!messageBar.classList.contains('new')) {
    return;
  }

  const displayedNotificationsEl = messageBar.querySelector('.mousehuntHeaderView-menu-notification');
  if (!displayedNotificationsEl) {
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
    if (!message?.isNew) {
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
 * Hide the Daily Draw inbox tab and leave its notifications out of the unread count.
 *
 * @param {Function} isHidden Whether the Daily Draw is currently hidden.
 */
export default (isHidden) => {
  if ('undefined' !== typeof messenger) {
    replaceInboxOpen(isHidden);
  }

  // this clears the notification count when it does its self request.
  setTimeout(() => removeDailyDrawNotifications(null, isHidden), 1000);
  onRequest('*', (data) => removeDailyDrawNotifications(data, isHidden));
};
