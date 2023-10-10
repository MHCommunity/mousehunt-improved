const injectedScript = document.createElement('script');
injectedScript.setAttribute('type', 'text/javascript');
injectedScript.setAttribute('src', chrome.runtime.getURL('main.js'));
document.body.appendChild(injectedScript);

const injectedStyle = document.createElement('link');
injectedStyle.setAttribute('rel', 'stylesheet');
injectedStyle.setAttribute('type', 'text/css');
injectedStyle.setAttribute('href', chrome.runtime.getURL('main.css'));

document.head.appendChild(injectedStyle);
