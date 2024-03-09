import { debug } from './debug';
import { makeElement } from './elements';

import errorStyles from './styles/errors.css';

/**
 * Show an error message appended to the given element.
 *
 * @param {Object}      options           Options for the message.
 * @param {string}      options.message   Message to show.
 * @param {HTMLElement} options.append    Element to append the error to.
 * @param {boolean}     options.before    Whether to append the message before the element.
 * @param {boolean}     options.after     Whether to append the message after the element.
 * @param {string}      options.classname Classes to add to the error element.
 * @param {string}      options.type      Type of message to show (error or success).
 */
const showErrorMessage = (options) => {
  const {
    message,
    append,
    before = false,
    after = false,
    classname = [],
    type = 'error',
  } = options;

  const typeClass = `mh-ui-${type}-message`;
  const existing = document.querySelector(`.${typeClass}`);
  if (existing) {
    existing.remove();
  }

  const error = makeElement('div', [`mh-ui-${type}-message`, 'mh-ui-fade', classname], message);

  if (append) {
    if (before) {
      append.before(error);
    } else if (after) {
      append.after(error);
    } else {
      append.append(error);
    }
  }

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
 * @param {Object}      opts         Options for the message.
 * @param {string}      opts.message Message to show.
 * @param {HTMLElement} opts.append  Element to append the error to.
 * @param {boolean}     opts.before  Whether to append the message before the element.
 * @param {boolean}     opts.after   Whether to append the message after the element.
 * @param {string}      opts.classes Classes to add to the error element.
 */
const showSuccessMessage = (opts) => {
  opts.type = 'success';
  showErrorMessage(opts);
};

hadAddedErrorStyles = false;
/**
 * Show an error message when the script fails to load.
 *
 * @param {Error} e The error that was thrown.
 */
const showLoadingError = (e) => {
  debug('Error loading MouseHunt Improved:', e);

  // Add the error to the page.
  const errorElement = makeElement('div', 'mousehunt-improved-error');
  makeElement('h1', 'mousehunt-improved-error-title', 'Error loading MouseHunt Improved', errorElement);

  if (e.message) {
    const errorText = makeElement('textarea', 'mousehunt-improved-error-message');
    errorText.value = `${e.message}\n\n${e.stack}`;
    errorElement.append(errorText);
  }

  makeElement('p', 'mousehunt-improved-error-message', 'There was an error loading MouseHunt Improved. Try refreshing the page. If the error persists, please add an issue to the <a href="https://github.com/MHCommunity/mousehunt-improved">GitHub repo</a>.', errorElement);

  const closeButton = makeElement('button', 'mousehunt-improved-error-close', 'Close');
  closeButton.addEventListener('click', () => {
    errorElement.remove();
  });
  errorElement.append(closeButton);

  document.body.append(errorElement);

  if (hadAddedErrorStyles) {
    return;
  }

  const errorStylesEl = makeElement('style', 'mh-improved-error-styles', errorStyles);
  document.head.append(errorStylesEl);
};

export {
  showErrorMessage,
  showSuccessMessage,
  showLoadingError
};
