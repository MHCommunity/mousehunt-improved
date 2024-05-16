// Hide the body, load the script, then show the body again to avoid flickering.
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.visibility = 'hidden';

  const injectedScript = document.createElement('script');
  injectedScript.setAttribute('type', 'text/javascript');
  injectedScript.setAttribute('src', chrome.runtime.getURL('main.js'));
  document.body.append(injectedScript);

  // Wait for the script to load, then show the body again.
  injectedScript.onload = () => {
    document.body.style.visibility = 'visible';
  };
});
