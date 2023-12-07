const injectedScript = document.createElement('script');
injectedScript.setAttribute('type', 'text/javascript');
injectedScript.setAttribute('src', chrome.runtime.getURL('main.js'));
document.body.append(injectedScript);
