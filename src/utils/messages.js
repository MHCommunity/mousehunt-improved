import { debug } from './debug';
import { makeElement } from './elements';

/**
 * Show an error message appended to the given element.
 *
 * @param {string}      message  Message to show.
 * @param {HTMLElement} appendTo Element to append the error to.
 * @param {string}      classes  Classes to add to the error element.
 * @param {string}      type     Type of error to show, either 'error' or 'success'.
 */
const showErrorMessage = (message, appendTo, classes = '', type = 'error') => {
  if (! appendTo) {
    appendTo = document.querySelector('.treasureMapRootView-subTabRow.treasureMapRootView-padding');
  }

  const typeClass = `mh-ui-${type}-message`;
  const existing = document.querySelector(`.${typeClass}`);
  if (existing) {
    existing.remove();
  }

  const error = makeElement('div', [`mh-ui-${type}-message`, 'mh-ui-fade', classes], message);
  appendTo.append(error);

  setTimeout(() => {
    error.classList.add('mh-ui-fade-in');
  }, 10);

  setTimeout(() => {
    error.classList.remove('mh-ui-fade-in');
    error.classList.add('mh-ui-fade-out');
  }, 2000);

  setTimeout(() => {
    error.remove();
  }, 2500);
};

/**
 * Show a success message appended to the given element.
 *
 * @see showErrorMessage
 *
 * @param {string}      message  Message to show.
 * @param {HTMLElement} appendTo Element to append the message to.
 * @param {string}      classes  Classes to add to the message element.
 */
const showSuccessMessage = (message, appendTo, classes = '') => {
  showErrorMessage(message, appendTo, classes, 'success');
};

/**
 * Show an error message when the script fails to load.
 *
 * @param {Error} e The error that was thrown.
 */
const showLoadingError = (e) => {
  debug('Error loading MouseHunt Improved:', e);

  // Add the error to the page.
  const errorElement = document.createElement('div');
  errorElement.classList.add('mousehunt-improved-error');
  errorElement.innerHTML = '<h1>Error loading MouseHunt Improved</h1>';
  if (e.message) {
    errorElement.innerHTML += `<pre>${e.message}</pre>`;
  }
  errorElement.innerHTML += '<p>There was an error loading MouseHunt Improved. Try refreshing the page. If the error persists, please add an issue to the <a href="https://github.com/MHCommunity/mousehunt-improved">GitHub repo</a>.</p>';
  document.body.append(errorElement);

  const errorStyles = document.createElement('style');
  errorStyles.innerHTML = globalStyles;
  document.head.append(errorStyles);
};

export {
  showErrorMessage,
  showSuccessMessage,
  showLoadingError
};
