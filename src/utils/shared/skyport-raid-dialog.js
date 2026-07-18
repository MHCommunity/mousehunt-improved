import { addEvent, prepareLifecycleCallback } from '@utils';

const dialogClass = 'ceruleanSkyportRaidChoiceDialogPopup';

/**
 * Check whether a game dialog is the Skyport raid choice dialog.
 *
 * @param {Object} dialog The game dialog.
 *
 * @return {boolean} Whether this is the raid choice dialog.
 */
const isRaidDialog = (dialog) => {
  return dialog?.getAttributes?.().className?.split(/\s+/).includes(dialogClass) || false;
};

/**
 * Register a callback for a Skyport raid dialog event.
 *
 * The game fires its show event just before the raid view is appended, so show callbacks
 * run in a microtask after the current render stack finishes.
 *
 * @param {string}   event    The game dialog event.
 * @param {Function} callback The callback to run.
 * @param {boolean}  deferred Whether to defer until the raid view is mounted.
 */
const onSkyportRaidDialog = (event, callback, deferred = false) => {
  const lifecycleCallback = prepareLifecycleCallback(callback, `skyport-raid-dialog:${event}`);
  if (lifecycleCallback.skip) {
    return;
  }

  const callbackId = lifecycleCallback.id || callback.name || callback.toString();
  addEvent(
    event,
    (dialog) => {
      if (!isRaidDialog(dialog)) {
        return;
      }

      if (deferred) {
        queueMicrotask(() => {
          if (document.querySelector('.ceruleanSkyportRaidChoiceDialogView__raidBlock[data-type]')) {
            lifecycleCallback.callback();
          }
        });
        return;
      }

      lifecycleCallback.callback();
    },
    { id: `skyport-raid-dialog:${event}:${callbackId}` }
  );
};

/**
 * Run a callback when the Skyport raid choice dialog is shown.
 *
 * @param {Function} callback The callback to run.
 */
const onSkyportRaidDialogShow = (callback) => {
  onSkyportRaidDialog('js_dialog_show', callback, true);
};

/**
 * Run a callback when the Skyport raid choice dialog is closed.
 *
 * @param {Function} callback The callback to run.
 */
const onSkyportRaidDialogHide = (callback) => {
  onSkyportRaidDialog('js_dialog_hide', callback);
};

export { onSkyportRaidDialogShow, onSkyportRaidDialogHide };
