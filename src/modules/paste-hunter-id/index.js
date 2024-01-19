const maybeRedirectToHunterProfile = (text) => {
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

  hg.utils.PageUtil.setPage('HunterProfile', {
    id: id[0],
  }, (data) => {
    const snuid = data.tabs.profile.subtabs[0].snuid;
    if (snuid) {
      hg.utils.PageUtil.showHunterProfile(snuid);
    }
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
const init = async () => {
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
