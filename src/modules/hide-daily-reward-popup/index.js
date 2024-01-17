import { onDialogShow } from '@utils';

/**
 * Initialize the module.
 */
const init = async () => {
  onDialogShow(() => {
    if (activejsDialog) {
      activejsDialog.hide();
    }
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
