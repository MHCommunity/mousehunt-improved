const versionEl = document.querySelector('#version');
if (versionEl) {
  versionEl.textContent = `v${chrome.runtime.getManifest().version}`;
}

const settingsButton = document.querySelector('.settings-button');

/**
 * Open the settings page, reusing an existing MouseHunt tab if there is one.
 *
 * @param {MouseEvent} event The click event.
 */
const openSettings = async (event) => {
  event.preventDefault();

  const settingsUrl = settingsButton.href;
  const tabs = await chrome.tabs.query({ url: '*://*.mousehuntgame.com/*' });
  const tab = tabs.find((t) => t.active) || tabs[0];

  if (tab) {
    await chrome.tabs.update(tab.id, { url: settingsUrl, active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: settingsUrl });
  }

  window.close();
};

settingsButton.addEventListener('click', openSettings);
