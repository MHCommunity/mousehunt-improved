import { getSettingDirect, saveSettingDirect } from './settings';
import { addStylesDirect } from './styles';
import { getFlag } from './flags';

import favoriteButtonStyles from './styles/favorite-button.css';

/**
 * Creates an element with the given tag, classname, text, and appends it to the given element.
 *
 * @param {string}      tag      The tag of the element to create.
 * @param {string}      classes  The classes of the element to create.
 * @param {string}      text     The text of the element to create.
 * @param {HTMLElement} appendTo The element to append the created element to.
 *
 * @return {HTMLElement} The created element.
 */
const makeElement = (tag, classes = '', text = '', appendTo = null) => {
  const element = document.createElement(tag);

  // if classes is an array, join it with a space.
  if (Array.isArray(classes)) {
    classes = classes.join(' ');
  }

  if (classes && classes.length) {
    element.className = classes;
  }

  element.innerHTML = text;

  if (appendTo) {
    appendTo.append(element);
    return appendTo;
  }

  return element;
};

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text          Text to use for link.
 * @param {string}  href          URL to link to.
 * @param {boolean} tiny          Use the tiny button style.
 * @param {Array}   extraClasses  Extra classes to add to the link.
 * @param {boolean} encodeAsSpace Encode spaces as %20 instead of _.
 *
 * @return {string} HTML for link.
 */
const makeButton = (text, href, tiny = true, extraClasses = [], encodeAsSpace = false) => {
  href = href.replaceAll(/\s/g, '_');

  href = encodeAsSpace ? href.replaceAll('_', '%20') : href.replaceAll(/\s/g, '_');

  href = href.replaceAll('$', '_');

  return `<a href="${href}" class="mousehuntActionButton ${tiny ? 'tiny' : ''} ${extraClasses.join(' ')}"><span>${text}</span></a>`;
};

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text          Text to use for link.
 * @param {string}  href          URL to link to.
 * @param {boolean} encodeAsSpace Encode spaces as %20.
 *
 * @return {string} HTML for link.
 */
const makeLink = (text, href, encodeAsSpace = false) => {
  if (encodeAsSpace) {
    href = href.replaceAll('_', '%20');
  }

  return `<a href="${href}" target="_mouse" class="mousehuntActionButton tiny"><span>${text}</span></a>`;
};

/**
 * Creates a favorite button that can toggle.
 *
 * @async
 *
 * @example <caption>Creating a favorite button</caption>
 * createFavoriteButton({
 *   id: 'testing_favorite',
 *   target: infobar,
 *   size: 'small',
 *   defaultState: false,
 * });
 *
 * @param {Object} options              The options for the button.
 * @param {string} options.selector     The selector for the button.
 * @param {string} options.size         Whether or not to use the small version of the button.
 * @param {string} options.active       Whether or not the button should be active by default.
 * @param {string} options.onChange     The function to run when the button is toggled.
 * @param {string} options.onActivate   The function to run when the button is activated.
 * @param {string} options.onDeactivate The function to run when the button is deactivated.
 *
 * @return {HTMLElement} The created button.
 */
const makeFavoriteButton = async (options) => {
  addStylesDirect(favoriteButtonStyles, 'mh-improved-styles-favorite-button', true);

  const {
    id = null,
    target = null,
    size = 'small',
    state = false,
    isSetting = true,
    defaultState = false,
    onChange = null,
    onActivate = null,
    onDeactivate = null,
  } = options;

  const existing = document.querySelector(`#${id}`);
  if (existing) {
    existing.remove();
  }

  const star = document.createElement('a');

  star.classList.add('custom-favorite-button');
  if (size === 'small') {
    star.classList.add('custom-favorite-button-small');
  }

  star.id = id;
  star.setAttribute('data-item-id', id);
  star.setAttribute('href', '#');

  star.style.display = 'inline-block';

  let currentSetting = false;
  currentSetting = isSetting ? getSettingDirect(id, defaultState) : state;

  if (currentSetting) {
    star.classList.add('active');
  } else {
    star.classList.add('inactive');
  }

  star.addEventListener('click', async (e) => {
    star.classList.add('busy');
    e.preventDefault();
    e.stopPropagation();
    const currentStar = e.target;
    const currentState = ! currentStar.classList.contains('active');

    if (onChange !== null) {
      await onChange(currentState);
    } else if (isSetting) {
      saveSettingDirect(id, currentState);
    }

    currentStar.classList.remove('inactive');
    currentStar.classList.remove('active');

    if (currentState) {
      currentStar.classList.add('active');
      if (onActivate !== null) {
        await onActivate(currentState);
      }
    } else {
      currentStar.classList.add('inactive');
      if (onDeactivate !== null) {
        await onDeactivate(currentState);
      }
    }

    /* Wait a tiny bit so that the user can see it did something. */
    setTimeout(() => {
      currentStar.classList.remove('busy');
    }, 300);
  });

  if (target) {
    target.append(star);
  }

  return star;
};

/**
 * Build a popup.
 *
 * @example
 * ```
 *
 * Template options:
 * ajax: no close button in lower right, 'prefix' instead of title. 'suffix' for close button area.
 * default: {*title*} {*content*}
 * error: in red, with error icon{*title*} {*content*}
 * largerImage: full width image {*title*} {*image*}
 * largerImageWithClass: smaller than larger image, with caption {*title*} {*image*} {*imageCaption*} {*imageClass*} (goes on the img tag)
 * loading: Just says loading
 * multipleItems: {*title*} {*content*} {*items*}
 * singleItemLeft: {*title*} {*content*} {*items*}
 * singleItemRight: {*title*} {*content*} {*items*}
 * ```
 *
 * @param {Object}  options                The popup options.
 * @param {string}  options.title          The title of the popup.
 * @param {string}  options.content        The content of the popup.
 * @param {boolean} options.hasCloseButton Whether or not the popup has a close button.
 * @param {string}  options.template       The template to use for the popup.
 * @param {boolean} options.show           Whether or not to show the popup.
 * @param {string}  options.className      The class name to add to the popup.
 *
 * @return {boolean|Object} The popup object or false if we can't create it.
 */
const createPopup = (options) => {
  // If we don't have jsDialog, bail.
  if ('undefined' === typeof jsDialog || ! jsDialog) {
    return false;
  }

  // Default to sensible values.
  const settings = Object.assign({}, {
    title: '',
    content: '',
    hasCloseButton: true,
    template: 'default',
    show: true,
    className: '',
  }, options);

  // Initiate the popup.
  const popup = new jsDialog();
  popup.setIsModal(! settings.hasCloseButton);

  // Set the template & add in the content.
  popup.setTemplate(settings.template);
  popup.addToken('{*title*}', settings.title);
  popup.addToken('{*content*}', settings.content);

  popup.setAttributes({
    className: settings.className,
  });

  // If we want to show the popup, show it.
  if (settings.show) {
    popup.show();
  }

  return popup;
};

/**
 * Make a tooltip.
 *
 * @param {Object}      options           The options for the tooltip.
 * @param {HTMLElement} options.appendTo  The element to append the tooltip to.
 * @param {string}      options.className The class name to add to the tooltip.
 * @param {string}      options.text      The text for the tooltip.
 *
 * @return {HTMLElement|boolean} The tooltip or false if we can't create it.
 */
const makeTooltip = (options) => {
  if (getFlag('disable-mh-improved-tooltips')) {
    return false;
  }

  if (! options.appendTo) {
    return false;
  }

  const { appendTo, className = '', text = '' } = options;

  const tooltip = makeElement('div', ['PreferencesPage__blackTooltip', 'mh-improved-tooltip', className]);
  makeElement('span', 'PreferencesPage__blackTooltipText', text, tooltip);
  appendTo.append(tooltip);

  return tooltip;
};

/**
 * Make a page.
 *
 * @param {string|HTMLElement|Function} content The content for the page.
 */
const makePage = (content) => {
  const setContent = () => {
    const pageContainer = document.querySelector('.mousehuntHud-page-tabContentContainer');
    if (! pageContainer) {
      return;
    }

    if (typeof content === 'function') {
      pageContainer.innerHTML = '';
      content(pageContainer);
    } else if (typeof content === 'object' && content instanceof HTMLElement) {
      pageContainer.innerHTML = '';
      pageContainer.append(content);
    } else {
      pageContainer.innerHTML = content;
    }
  };

  hg.utils.PageUtil.setPage('PrivacyPolicy', {}, setContent, setContent);
};

export {
  createPopup,
  makeButton,
  makeElement,
  makeLink,
  makeFavoriteButton,
  makeTooltip,
  makePage
};
