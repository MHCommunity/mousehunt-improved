const injectMain = () => {
  // Hide the body, load the script, then show the body again to avoid flickering.
  document.body.style.visibility = 'hidden';

  const injectedScript = document.createElement('script');
  injectedScript.setAttribute('id', 'mousehunt-improved-script');
  injectedScript.setAttribute('type', 'text/javascript');
  injectedScript.setAttribute('src', chrome.runtime.getURL('main.js'));
  injectedScript.setAttribute('data-baseurl', chrome.runtime.getURL('/'));
  document.body.append(injectedScript);

  /**
   * Wait for the script to load, then show the body again.
   */
  injectedScript.onload = () => {
    document.body.style.visibility = 'visible';
  };
};

/**
 * If the user elects to run the extension for this visit, then
 * DOMContentLoaded has probably alredy fired. In that case, just
 * go ahead and inject the main script if the document is ready.
 */
if (document.readyState === 'complete') {
  injectMain();
} else {
  window.addEventListener('DOMContentLoaded', injectMain);
}
