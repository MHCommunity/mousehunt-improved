const addMessageToInbox = () => {
  // get the date in this format "2023-11-01 05:34:15",
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const m = new MessengerUINotification();
  m.addMessage({
    messageId: 'mhui-v0.22.4',
    messageType: 'news',
    messageData: {
      text: '<img src="https://i.mouse.rip/mh-improved/icon-64.png" class="item" alt="MouseHunt Improved icon">MH Improved has been updated. <a href="#">Check out the changelog</a> for more details.',
      href: 'https://github.com/MHCommunity/mousehunt-improved/releases/tag/v0.22.3',
      cssClass: 'mhui-notification',
    },
    messageDate: date,
    isNew: true
  });
};

export default () => {
  addMessageToInbox();
};
