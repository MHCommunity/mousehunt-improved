const addUIStyles = (styles) => {
  const identifier = 'mh-ui-styles';

  const existingStyles = document.getElementById(identifier);
  if (existingStyles) {
    existingStyles.innerHTML += styles;
    return;
  }

  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text         Text to use for link.
 * @param {string}  href         URL to link to.
 * @param {Array}   extraClasses Extra classes to add to the link.
 * @param {boolean} tiny         Use the tiny button style.
 *
 * @return {string} HTML for link.
 */
const makeButton = (text, href, extraClasses = [], tiny = true) => {
  href = href.replace(/\s/g, '_');
  return `<a href="${href}" class="mousehuntActionButton ${tiny ? 'tiny' : ''} ${extraClasses.join(' ')}"><span>${text}</span></a>`;
};

/**
 * Adds classes to the body to enable styling based on the location or if dark mode is enabled.
 */
const addLocationBodyClass = () => {
  const addClass = () => {
    const location = getCurrentLocation();
    document.body.classList.add(`mh-location-${location}`);
  };

  addClass();
  onTravel(null, { callback: addClass });
};

const addDarkModeBodyClass = () => {
  if (getComputedStyle(document.documentElement).getPropertyValue('--mhdm-black')) {
    document.body.classList.add('mh-dark-mode');
  }
};

const addBodyClassesCallback = () => {
  addLocationBodyClass();
  addDarkModeBodyClass();
};

const addBodyClasses = () => {
  window.addEventListener('load', addBodyClassesCallback);
  eventRegistry.addEventListener(hg.utils.PageUtil.EventSetPage, addBodyClassesCallback);
};

export {
  addUIStyles,
  makeButton,
  addBodyClasses,
};
