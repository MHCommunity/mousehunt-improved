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

export default () => {
  const link = `https://github.com/MHCommunity/mousehunt-improved/releases/tag/${mhImprovedVersion}`;

  const { date, hasRead } = getReadUpdateNotificationTime(mhImprovedVersion);

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
