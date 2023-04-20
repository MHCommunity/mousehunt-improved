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
}

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text         Text to use for link.
 * @param {string}  href         URL to link to.
 * @param {array}   extraClasses Extra classes to add to the link.
 * @param {boolean} tiny         Use the tiny button style.
 *
 * @return {string} HTML for link.
 */
const makeButton = (text, href, extraClasses = [], tiny = true) => {
  href = href.replace(/\s/g, '_');
  return `<a href="${href}" class="mousehuntActionButton ${tiny ? 'tiny' : ''} ${extraClasses.join(' ')}"><span>${text}</span></a>`;
};

export {
  addUIStyles,
  makeButton,
}
