chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://www.mousehuntgame.com/' });
  } else if (details.reason === 'update') {
    chrome.tabs.create({ url: `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${chrome.runtime.getManifest().version}` });
  }
});
