const maybeRedirectToHunterProfile = (text) => {
  if (! /^\d+$/.test(text)) {
    return;
  }

  hg.utils.PageUtil.setPage('HunterProfile', {
    id: text,
  });
};

const listenForIDPaste = () => {
  // listen for the user hitting the paste shortcut.
  window.addEventListener('paste', (e) => {
    // if we're currently focused in an input, then don't do anything
    if (
      /* eslint-disable @wordpress/no-global-active-element */
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement
      /* eslint-enable @wordpress/no-global-active-element */
    ) {
      return;
    }

    maybeRedirectToHunterProfile(e.clipboardData.getData('text'));
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  listenForIDPaste();
};

export default {
  id: 'paste-hunter-id',
  name: 'Paste Hunter ID',
  type: 'feature',
  default: true,
  description: 'Copy a Hunter ID to your clipboard and then press Ctrl/Cmd+v anywhere to go directly to that hunter\'s profile.',
  load: init,
};
