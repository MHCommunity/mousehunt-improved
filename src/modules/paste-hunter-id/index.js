/**
 * Process a pasted string to see if it's a hunter ID, and if so, redirect to that hunter's profile.
 *
 * @param {string} text The pasted text.
 */
const maybeRedirectToHunterProfile = (text) => {
  if (text.length > 30) {
    return;
  }

  // if the text contains 'https://www.mousehuntgame.com/', then it's a full URL
  // and we should just redirect to that URL.
  const url = text.match(/https:\/\/www.mousehuntgame.com/);
  if (url) {
    window.location.href = text;
    return;
  }

  // regex out the digits from any text that was pasted
  const id = text.match(/\d+/);
  if (! id) {
    return;
  }

  if (! hg?.utils?.PageUtil?.setPage) {
    return;
  }

  hg.utils.PageUtil.setPage('HunterProfile', {
    id: id[0],
  }, (data) => {
    const snuid = data.tabs.profile.subtabs[0].snuid;
    if (snuid && hg?.utils?.PageUtil?.showHunterProfile) {
      hg.utils.PageUtil.showHunterProfile(snuid);
    }
  });
};

/**
 * Listen for the user hitting the paste shortcut and maybe redirect to the hunter's profile.
 */
const listenForIDPaste = () => {
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
const init = async () => {
  listenForIDPaste();
};

/**
 * Initialize the module.
 */
export default {
  id: 'paste-hunter-id',
  name: 'Paste Hunter ID',
  type: 'feature',
  default: true,
  description: 'Copy a Hunter ID to your clipboard and then press Ctrl/Cmd+v anywhere to go directly to that hunter\'s profile.',
  load: init,
};
