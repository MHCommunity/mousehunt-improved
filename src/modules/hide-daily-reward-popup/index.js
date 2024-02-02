import { debuglog, onDialogShow, onRequest } from '@utils';

const hidePopup = () => {
  debuglog('hide-daily-reward-popup', 'Attempting to hide daily reward popup');
  if (activejsDialog) {
    debuglog('hide-daily-reward-popup', 'ActiveJS dialog found');
    const attrs = activejsDialog.getAttributes();
    debuglog('hide-daily-reward-popup', 'ActiveJS dialog attributes', attrs);
    if (attrs && attrs.className && attrs.className === 'dailyRewardPopup') {
      activejsDialog.hide();
    }
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  onDialogShow(() => {
    setTimeout(() => {
      if (activejsDialog) {
        activejsDialog.hide();
      }
    }, 500);
  }, 'dailyRewardPopup');

  hidePopup();
  setTimeout(hidePopup, 1000);
  setTimeout(hidePopup, 2000);

  onRequest(hidePopup);
};

export default {
  id: 'hide-daily-reward-popup',
  name: 'Hide Daily Reward Popup',
  type: 'element-hiding',
  default: false,
  description: 'Automatically hide the daily reward popup.',
  load: init,
};
