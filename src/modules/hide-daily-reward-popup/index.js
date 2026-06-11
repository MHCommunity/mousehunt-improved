import { onDialogShow, onRequest } from '@utils';

/**
 * Get the active dialog if available.
 *
 * @return {Object|null} The active dialog.
 */
const getActiveDialog = () => {
  return typeof activejsDialog === 'undefined' ? null : activejsDialog;
};

/**
 * Hide the daily reward popup.
 */
const hidePopup = () => {
  const dialog = getActiveDialog();
  if (! dialog?.hide || ! dialog?.getAttributes) {
    return;
  }

  const attrs = dialog.getAttributes();
  if (attrs?.className === 'dailyRewardPopup') {
    dialog.hide();
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  onDialogShow('dailyRewardPopup', () => {
    setTimeout(() => {
      const dialog = getActiveDialog();
      if (dialog?.hide) {
        dialog.hide();
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
