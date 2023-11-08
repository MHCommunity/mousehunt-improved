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
      document.activeElement instanceof HTMLInputElement || // eslint-disable-line @wordpress/no-global-active-element
      document.activeElement instanceof HTMLTextAreaElement || // eslint-disable-line @wordpress/no-global-active-element
      document.activeElement instanceof HTMLSelectElement // eslint-disable-line @wordpress/no-global-active-element
    ) {
      return;
    }

    maybeRedirectToHunterProfile(e.clipboardData.getData('text'));
  });
};

export default () => {
  listenForIDPaste();
};
