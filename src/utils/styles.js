import { onEvent } from './event-registry';

/**
 * Add styles to the page.
 *
 * @author bradp
 * @since 1.0.0
 *
 * @example <caption>Basic usage</caption>
 * addStylesDirect(`.my-class {
 *   color: red;
 * }`);
 *
 * @example <caption>With an identifier</caption>
 * addStylesDirect(`.my-class {
 * display: none;
 * }`, 'my-identifier');
 *
 * @example <caption>With an identifier, but will only add the styles once</caption>
 * addStylesDirect(`.my-other-class {
 * color: blue;
 * }`, 'my-identifier', true);
 *
 * @param {string}  styles     The styles to add.
 * @param {string}  identifier The identifier to use for the style element.
 * @param {boolean} once       Only add the styles once for the identifier.
 *
 * @return {Element} The style element.
 */
const addStylesDirect = (styles, identifier = 'mh-utils-custom-styles', once = false) => {
  identifier = `mh-utils-${identifier}`;

  // Check to see if the existing element exists.
  const existingStyles = document.querySelector(`#${identifier}`);

  // If so, append our new styles to the existing element.
  if (existingStyles) {
    if (once) {
      return existingStyles;
    }

    existingStyles.innerHTML += styles;
    return existingStyles;
  }

  // Otherwise, create a new element and append it to the head.
  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.append(style);

  return style;
};

/**
 * Add custom styles to the page.
 *
 * @param {string|Array} styles     CSS to add to the page.
 * @param {string}       module     The module ID to add the styles to.
 * @param {string}       identifier Identifier to use for the styles.
 *
 * @return {Element} The style element.
 */
const addStyles = (styles, module = false, identifier = 'mh-improved-styles') => {
  if (! module) {
    throw new Error('Module ID is required for adding module styles.', module);
  }

  const key = `${identifier}-${module}`;

  let stylesEl = addModuleStyles(styles, key, true);

  onEvent(`mh-improved-settings-changed-${module}`, (enabled) => {
    if (enabled) {
      stylesEl = addModuleStyles(styles, key, true);
    } else if (stylesEl) {
      stylesEl.remove();
      stylesEl = null;
    }
  });

  return stylesEl;
};

/**
 * Add custom styles to the page.
 *
 * @param {string|Array} styles     CSS to add to the page.
 * @param {string}       identifier Identifier to use for the styles.
 * @param {boolean}      replace    Whether to replace the existing styles.
 *
 * @return {Element} The style element.
 */
const addModuleStyles = (styles, identifier = 'mh-improved-styles', replace = false) => {
  const existingStyles = document.querySelector(`#${identifier}`);

  styles = Array.isArray(styles) ? styles.join('\n') : styles;

  if (existingStyles) {
    existingStyles.innerHTML = replace ? styles : existingStyles.innerHTML + styles;

    return existingStyles;
  }

  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.append(style);

  return style;
};

/**
 * Remove custom styles from the page for a specific module.
 *
 * @param {string} module     The module ID whose styles should be removed.
 * @param {string} identifier Identifier used for the styles.
 */
const removeStyles = (module = false, identifier = 'mh-improved-styles') => {
  if (! module) {
    throw new Error('Module ID is required for adding module styles.', module);
  }

  const key = `${identifier}-${module}`;
  const stylesEl = document.querySelector(`#${key}`);
  if (stylesEl) {
    stylesEl.remove();
  }
};

/**
 * Add custom styles specific for a location HUD.
 *
 * @param {string|Array} styles CSS to add to the page.
 */
const addHudStyles = async (styles) => {
  removeHudStyles();
  addStyles(styles, 'mh-improved-styles-location-hud');
};

/**
 * Remove all location hud styles.
 */
const removeHudStyles = () => {
  const styles = document.querySelectorAll('.mh-improved-styles-location-hud');
  styles.forEach((style) => {
    style.remove();
  });
};

/**
 * Add external styles to the page.
 *
 * @param {string} url The URL of the external styles.
 *
 * @return {Element} The style element.
 */
const addExternalStyles = async (url) => {
  const identifier = url.split('/').pop().split('.').shift();

  const existingStyles = document.querySelector(`#${identifier}-external`);

  if (existingStyles) {
    return existingStyles;
  }

  const style = document.createElement('link');
  style.id = `${identifier}-external`;
  style.rel = 'stylesheet';
  style.href = `${url}?v=${mhImprovedVersion}-external`;

  document.head.append(style);

  return style;
};

export {
  addStylesDirect,
  addHudStyles,
  addStyles,
  removeHudStyles,
  removeStyles,
  addExternalStyles
};
