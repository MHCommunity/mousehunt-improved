const getReadUpdateNotification = (version) => {
  return getSetting(version, false, 'mousehunt-improved-update-notifications');
};

const setReadUpdateNotification = (version) => {
  return saveSetting(version, true, 'mousehunt-improved-update-notifications');
};

const addMessageToInbox = (version) => {
  // get the date in this format "2023-11-01 05:34:15".
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const link = `https://github.com/MHCommunity/mousehunt-improved/releases/tag/${version}`;

  const m = new MessengerUINotification();
  m.addMessage({
    messageId: `mhui-update-notification-${version}`,
    messageType: 'news',
    messageData: {
      text: `<img src="https://i.mouse.rip/mh-improved/icon-64.png" class="item" alt="MouseHunt Improved icon">MH Improved has been updated to v${version}! <a href="${link}">Check out the changelog</a> for more details.`,
      href: link,
      cssClass: 'mhui-notification',
    },
    messageDate: date,
    isNew: true
  });

  setReadUpdateNotification(version);
};

export default () => {
  if (getReadUpdateNotification(mhImprovedVersion)) {
    return;
  }

  addMessageToInbox(mhImprovedVersion);
  setReadUpdateNotification(mhImprovedVersion);
};
