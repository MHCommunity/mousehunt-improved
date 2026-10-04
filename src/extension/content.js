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
 * Warm up the connections to our API and image CDN, which are used on every page load.
 *
 * @param {string}  href        The origin to connect to.
 * @param {boolean} crossOrigin Whether the connection is for CORS requests (fetch) or not (images).
 */
const preconnect = (href, crossOrigin = false) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }

  document.documentElement.append(link);
};

preconnect('https://api.mouse.rip', true);
preconnect('https://i.mouse.rip');

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
