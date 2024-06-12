import { getSetting, saveSetting } from './settings';

/**
 * Creates an element with the given tag, class name, text, and appends it to the given element.
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
 * Create a MouseHunt button.
 *
 * @param {Object}      opts           The options for the button.
 * @param {string}      opts.text      The text for the button.
 * @param {string}      opts.size      The size of the button.
 * @param {string}      opts.className The class name for the button.
 * @param {Function}    opts.callback  The callback for the button.
 * @param {HTMLElement} opts.appendTo  The element to append the button to.
 *
 * @return {HTMLElement} The created button.
 */
const makeMhButton = (opts) => {
  const {
    text = '',
    size = 'small',
    className = '',
    callback = () => {},
    appendTo = null,
  } = opts;

  const button = makeElement('a', ['mousehuntActionButton', size, className]);
  makeElement('span', '', text, button);

  button.title = opts.title || text;

  button.addEventListener('click', () => {
    callback(button);
  });

  if (appendTo) {
    appendTo.append(button);
  }

  return button;
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
  currentSetting = isSetting ? getSetting(id, defaultState) : state;

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
      saveSetting(id, currentState);
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
  /**
   * Set the content of the page being created.
   */
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

  if (! hg?.utils?.PageUtil?.setPage) {
    return;
  }

  hg.utils.PageUtil.setPage('PrivacyPolicy', {}, setContent, setContent);
};

/**
 * Create a math button to add or subtract from an input.
 *
 * @param {number}      amount          The amount to add or subtract.
 * @param {Object}      opts            The options for the button.
 * @param {HTMLElement} opts.appendTo   The element to append the button to.
 * @param {HTMLElement} opts.input      The input to update.
 * @param {number}      opts.maxQty     The maximum quantity for the input.
 * @param {Array}       opts.classNames The class names to add to the button.
 *
 * @return {HTMLElement} The created button.
 */
const makeMathButton = (amount, opts) => {
  const {
    appendTo = null,
    input = null,
    maxQty = 0,
    classNames = [],
  } = opts;

  const button = makeElement('a', ['mousehuntActionButton', 'mh-improved-math-button', ...classNames]);

  const plusText = amount > 0 ? `+${amount}` : amount;
  const minusText = amount > 0 ? `-${amount}` : amount;
  const buttonText = makeElement('span', '', plusText);

  /**
   * Update the button text based on the shift key.
   *
   * @param {Event} e The event object.
   */
  const updateButtonText = (e) => {
    const currentText = buttonText.innerText;

    if (e.shiftKey && currentText !== minusText) {
      buttonText.innerText = minusText;
    } else if (! e.shiftKey && currentText !== plusText) {
      buttonText.innerText = plusText;
    }
  };

  buttonText.addEventListener('mouseover', updateButtonText);
  window.addEventListener('keydown', updateButtonText);
  window.addEventListener('keyup', updateButtonText);

  button.append(buttonText);

  button.addEventListener('click', (e) => {
    e.preventDefault();

    let current = Number.parseInt(input.value, 10);
    if (Number.isNaN(current)) {
      current = 0;
    }

    const tempAmount = e.shiftKey ? -amount : amount;

    if (current + tempAmount >= maxQty) {
      input.value = maxQty;
    } else if (current + tempAmount <= 0) {
      input.value = 0;
    } else {
      input.value = current + tempAmount;
    }

    const event = new Event('keyup');
    input.dispatchEvent(event);
  });

  if (appendTo) {
    appendTo.append(button);
  }

  return button;
};

/**
 * Create a series of math buttons.
 *
 * @param {Array}       amounts         The amounts to add or subtract.
 * @param {Object}      opts            The options for the buttons.
 * @param {HTMLElement} opts.appendTo   The element to append the button to.
 * @param {HTMLElement} opts.input      The input to update.
 * @param {number}      opts.maxQty     The maximum quantity for the input.
 * @param {Array}       opts.classNames The class names to add to the button.
 *
 * @return {Array} The created buttons.
 */
const makeMathButtons = (amounts, opts) => {
  const returnVal = [];
  amounts.forEach((amount) => {
    returnVal.push(makeMathButton(amount, opts));
  });

  return returnVal;
};

/**
 * Escape JSON for use in HTML.
 *
 * @param {Object} obj The object to escape.
 *
 * @return {string} The escaped JSON.
 */
const toEscapedJSON = (obj) => {
  return JSON.stringify(obj).replaceAll('"', '&quot;');
};

/**
 * Create a progress log link.
 *
 * @param {Object}   opts                       The options for generating the link.
 * @param {string}   opts.time                  The time duration for the progress log.
 * @param {Object[]} opts.catches               The array of catches.
 * @param {number}   opts.catches[].id          The ID of the mouse caught.
 * @param {number}   opts.catches[].caught      The number of times caught.
 * @param {number}   opts.catches[].environment The environment ID where caught.
 * @param {Object[]} opts.baits                 The array of baits used.
 * @param {number}   opts.baits[].id            The ID of the bait.
 * @param {number}   opts.baits[].used          The number of times the bait was used.
 * @param {number}   opts.baits[].catches       The number of catches made with the bait.
 * @param {number}   opts.baits[].fta           The number of times the bait failed to attract.
 * @param {number}   opts.baits[].ftc           The number of times the bait failed to catch.
 * @param {number}   opts.baits[].stale         The number of times the bait went stale.
 * @param {number}   opts.baits[].stolen        The number of times the bait was stolen.
 * @param {Object[]} opts.loots                 The array of loots collected.
 * @param {number}   opts.loots[].id            The ID of the loot.
 * @param {number}   opts.loots[].quantity      The quantity of the loot collected.
 *
 * @return {string} The generated progress log link.
 */
const makeProgressLogLink = (opts = {}) => {
  const progress = {
    time: opts.time || '1 day, 12 hours',
    catches: opts.catches || [],
    baits: opts.baits || [],
    loots: opts.loots || [],
  };

  const catches = {};
  const baits = {};
  const loots = {};

  progress.catches.forEach((mouse) => {
    catches[`${mouse.environment}_${mouse.id}`] = mouse.caught;
  });

  progress.baits.forEach((bait) => {
    baits[`${bait.id}_bu`] = bait.used || bait.catches + bait.fta + bait.ftc;
    baits[`${bait.id}_c`] = bait.catches;
    baits[`${bait.id}_m`] = bait.ftc;
    baits[`${bait.id}_af`] = bait.fta;
    baits[`${bait.id}_bs`] = bait.stale;
    baits[`${bait.id}_bl`] = bait.stolen;
  });

  progress.loots.forEach((loot) => {
    loots[loot.id] = loot.quantity;
  });

  return `<a href="#" onclick="app.views.HeadsUpDisplayView.hud.showLogSummary('${progress.time}', ${toEscapedJSON(catches)}, ${toEscapedJSON(baits)}, ${toEscapedJSON(loots)}); return false;" class="mh-ui-progress-log-link mousehuntActionButton small lightBlue"><span>${opts.text || 'View Progress Log'}</span></a>`;
};

export {
  createPopup,
  makeButton,
  makeElement,
  makeLink,
  makeFavoriteButton,
  makeTooltip,
  makePage,
  makeMhButton,
  makeMathButton,
  makeMathButtons,
  toEscapedJSON,
  makeProgressLogLink
};
