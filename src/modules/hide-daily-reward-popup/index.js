import { onDialogShow } from '@utils';

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
};

export default {
  id: 'hide-daily-reward-popup',
  name: 'Hide Daily Reward Popup',
  type: 'element-hiding',
  default: false,
  description: 'Automatically hide the daily reward popup.',
  load: init,
};
