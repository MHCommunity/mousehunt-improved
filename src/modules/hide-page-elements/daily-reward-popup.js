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
  if (!dialog?.hide || !dialog?.getAttributes) {
    return;
  }

  const attrs = dialog.getAttributes();
  if (attrs?.className === 'dailyRewardPopup') {
    dialog.hide();
  }
};

/**
 * Close the daily reward popup whenever it opens.
 *
 * @param {Function} isHidden Whether the daily reward popup is currently hidden.
 */
export default (isHidden) => {
  onDialogShow('dailyRewardPopup', () => {
    setTimeout(() => {
      const dialog = getActiveDialog();
      if (isHidden() && dialog?.hide) {
        dialog.hide();
      }
    }, 500);
  });

  if (isHidden()) {
    hidePopup();
    setTimeout(hidePopup, 1000);
    setTimeout(hidePopup, 2000);
  }

  onRequest('*', () => {
    if (isHidden()) {
      hidePopup();
    }
  });
};
