/**
 * Check if the text is an https URL on www.mousehuntgame.com.
 *
 * @param {string} text The text to check.
 *
 * @return {boolean} Whether it's a game URL.
 */
const isGameUrl = (text) => {
  try {
    const url = new URL(text);
    return 'https:' === url.protocol && 'www.mousehuntgame.com' === url.hostname;
  } catch {
    return false;
  }
};

/**
 * Process a pasted string to see if it's a hunter ID, and if so, redirect to that hunter's profile.
 *
 * @param {string} text The pasted text.
 */
const maybeRedirectToHunterProfile = (text) => {
  text = text.trim();

  // If it's a profile.php?snuid=... link, pull the snuid out and go directly to
  // that profile. The snuid can be numeric (578354432) or a hashed string
  // (hg_a07516a70978d1dbaf9e29ce638073d9).
  const profileMatch = text.match(/mousehuntgame\.com\/profile\.php\?.*\bsnuid=([\w-]+)/i);
  if (profileMatch) {
    const snuid = profileMatch[1];
    if (snuid && hg?.utils?.PageUtil?.showHunterProfile) {
      hg.utils.PageUtil.showHunterProfile(snuid);
    }

    return;
  }

  if (text.length > 30) {
    return;
  }

  // If it's a full mousehuntgame.com URL, go straight there.
  if (isGameUrl(text)) {
    window.location.href = text;
    return;
  }

  // regex out the digits from any text that was pasted
  const id = text.match(/\d+/);
  if (!id) {
    return;
  }

  if (!hg?.utils?.PageUtil?.setPage) {
    return;
  }

  hg.utils.PageUtil.setPage(
    'HunterProfile',
    {
      id: id[0],
    },
    (data) => {
      const snuid = data.tabs.profile.subtabs[0].snuid;
      if (snuid && hg?.utils?.PageUtil?.showHunterProfile) {
        hg.utils.PageUtil.showHunterProfile(snuid);
      }
    }
  );
};

/**
 * Listen for the user hitting the paste shortcut and maybe redirect to the hunter's profile.
 */
let hasPasteListener = false;
const listenForIDPaste = () => {
  if (hasPasteListener) {
    return;
  }

  hasPasteListener = true;
  window.addEventListener('paste', (e) => {
    // if we're currently focused in an input, then don't do anything
    if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLSelectElement) {
      return;
    }

    maybeRedirectToHunterProfile(e.clipboardData.getData('text'));
  });
};

export default listenForIDPaste;
