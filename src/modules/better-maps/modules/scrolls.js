import { getSetting, makeElement, onRequest } from '@utils';

/**
 * Update the scroll content.
 *
 * @param {Element} scroll The scroll element.
 */
const updateScrollContent = (scroll) => {
  const content = scroll.querySelector('.treasureMapInventoryView-scrollCase-content');
  if (! content) {
    return;
  }

  // Replace the bold loot list with a comma separated list.
  const matches = content.innerHTML.match(/<b>• (.*?)<\/b>/g);
  if (matches && matches.length > 1) {
    let replacements = matches.map((match) => match.replaceAll(/<b>• (.*?)<\/b>/g, '$1'));
    const last = replacements.pop();
    replacements = replacements.map((replacement, index) => index < replacements.length - 1 ? replacement + ',' : replacement + ', and');
    replacements.push(last);

    let replacementIndex = 0;
    content.innerHTML = content.innerHTML.replaceAll(/<b>• (.*?)<\/b>/g, () => replacements[replacementIndex++]);
  }

  let auras = [];

  const aurasEl = content.querySelectorAll('.treasureMapInventoryView-scrollCase-aura');
  if (aurasEl.length) {
    auras = [...aurasEl];
  }

  // The content is the name div, the text content, and then the aura divs. We want to wrap the text content and aura divs in a div, so we can apply a class to the text content.
  // Create new divs for the text and the auras
  const textDiv = makeElement('div', 'scroll-text');
  const aurasDiv = makeElement('div', 'scroll-auras');

  // Iterate over the child nodes of the content element
  [...content.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE || node.tagName === 'B' || node.tagName === 'BR') {
      textDiv.append(node);
    } else if (auras.includes(node)) {
      aurasDiv.append(node);
    }
  });

  content.append(textDiv);
  content.append(aurasDiv);

  // Simplify the aura text.
  if (aurasEl.length) {
    aurasEl.forEach((aura) => {
      const title = aura.querySelector('b');
      if (title) {
        title.textContent = title.textContent.replace('Opening this map\'s reward will give hunters ', 'This map\'s reward gives you ');
      }

      aura.innerHTML = aura.innerHTML
        .replace('This special Trap Aura', 'This ')
        .replace('with the chance at the following additional loot:', 'with the chance of ')
        .replace('- Chrome Theme Scrap II', 'Chrome Theme Scrap II')
        .replace('- Chrome Charms', ' and Chrome Charms.');
    });
  }
};

/**
 * Check if we need to lock or hide the scroll from the inventory lock and hide module.
 *
 * @param {Element} scroll     The scroll element.
 * @param {Element} action     The action element.
 * @param {string}  scrollType The scroll type.
 */
const maybeLockAndHide = (scroll, action, scrollType) => {
  let lockAndHide = getSetting('inventory-lock-and-hide.items', {});
  lockAndHide = {
    locked: [],
    hidden: [],
    lockedTypes: [],
    hiddenTypes: [],
    ...lockAndHide
  };

  const locked = lockAndHide?.lockedTypes?.includes(scrollType);
  const hidden = lockAndHide?.hiddenTypes?.includes(scrollType);

  if (locked) {
    scroll.classList.add('locked');
    action.classList.add('disabled');
  }

  if (hidden) {
    scroll.classList.add('hidden');
  }
};

/**
 * Update the scrolls markup and reorganize the content.
 */
const updateScrollsMarkup = () => {
  const scrolls = document.querySelectorAll('.treasureMapInventoryView-scrollCase');
  if (! scrolls.length) {
    return;
  }

  scrolls.forEach((scroll) => {
    const action = scroll.querySelector('.treasureMapInventoryView-scrollCase-action');
    if (! action) {
      return;
    }

    const button = action.querySelector('.mousehuntActionButton');
    if (button) {
      const scrollType = button.getAttribute('data-item-type');
      if (scrollType) {
        maybeLockAndHide(scroll, action, scrollType);
      }
    }

    updateScrollContent(scroll);
  });
};

/**
 * Update the shops markup from a click.
 */
const updateFromClick = async () => {
  const _showInventory = hg.controllers.TreasureMapController.showInventory;

  /**
   * Show the shops.
   *
   * @param {Object} data The data.
   */
  hg.controllers.TreasureMapController.showInventory = (data) => {
    _showInventory(data);
    updateScrollsMarkup();
  };
};

/**
 * Update the shops from a request.
 *
 * @param {Object} response The response.
 * @param {Object} data     The data.
 */
const updateFromRequest = (response, data) => {
  if (data?.action !== 'get_inventory') {
    return;
  }

  updateScrollsMarkup();
};

/**
 * Initialize the module.
 */
export default async () => {
  updateFromClick();
  onRequest('users/treasuremap.php', updateFromRequest);
};
