import { onDialogShow, onRequest } from '@utils';

const hidePopup = () => {
  if (activejsDialog) {
    const attrs = activejsDialog.getAttributes();
    if (attrs && attrs.className && attrs.className === 'dailyRewardPopup') {
      activejsDialog.hide();
    }
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  onDialogShow('dailyRewardPopup', () => {
    setTimeout(() => {
      if (activejsDialog) {
        activejsDialog.hide();
      }
    }, 500);
  });

  hidePopup();
  setTimeout(hidePopup, 1000);
  setTimeout(hidePopup, 2000);

  onRequest('*', hidePopup);
};

/**
 * Initialize the module.
 */
export default {
  id: 'hide-daily-reward-popup',
  name: 'Hide Daily Reward Popup',
  type: 'element-hiding',
  default: false,
  description: 'Automatically hide the daily reward popup.',
  load: init,
};
