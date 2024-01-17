// Hide the body, load the script, then show the body again to avoid flickering.
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.display = 'none';

  const injectedScript = document.createElement('script');
  injectedScript.setAttribute('type', 'text/javascript');
  injectedScript.setAttribute('src', chrome.runtime.getURL('main.js'));
  document.body.append(injectedScript);

  // wait for the script to load, then show the body again.
  injectedScript.addEventListener('load', () => {
    document.body.style.display = 'block';
  });
});
