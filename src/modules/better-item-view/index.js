import {
  addStyles,
  getArForMouse,
  getSetting,
  makeElement,
  makeLink,
  makeMathButtons,
  makeTooltip,
  onNavigation,
  onOverlayChange,
  onRender
} from '@utils';

import hoverItem from './modules/hover-item';
import settings from './settings';

import styles from './styles.css';

/**
 * Get the markup for the mouse links.
 *
 * @param {string} name The name of the mouse.
 * @param {string} id   The ID of the mouse.
 *
 * @return {string} The markup for the mouse links.
 */
const getLinkMarkup = (name, id) => {
  return makeLink('MHCT', `https://api.mouse.rip/mhct-redirect-item/${id}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${encodeURIComponent(name.replaceAll(' ', '_'))}`, true);
};

/**
 * Add links to the mouse overlay.
 *
 * @param {string} itemId The ID of the item.
 */
const addLinks = (itemId) => {
  const title = document.querySelector('.itemView-header-name');
  if (! title) {
    return;
  }

  const currentLinks = document.querySelector('.mh-item-links');
  if (currentLinks) {
    currentLinks.remove();
  }

  const div = document.createElement('div');
  div.classList.add('mh-item-links');
  div.innerHTML = getLinkMarkup(title.innerText, itemId);
  title.append(div);

  // Move the values into the main text.
  const values = document.querySelector('.mouseView-values');
  const desc = document.querySelector('.mouseView-descriptionContainer');
  if (values && desc) {
    // insert as first child of desc
    desc.insertBefore(values, desc.firstChild);
  }
};

const addQuantityButtons = (itemView) => {
  const quantityForm = itemView.querySelector('.itemView-action-convertForm');
  if (! quantityForm) {
    return;
  }

  const input = quantityForm.querySelector('.itemView-action-convert-quantity');
  if (! input) {
    return;
  }

  const quantity = quantityForm.innerText.split('/');
  if (! quantity || quantity.length !== 2) {
    return;
  }

  const maxQty = Number.parseInt(quantity[1].trim(), 10);

  const openControls = makeElement('div', ['mh-improved-item-open-controls']);

  makeMathButtons([1, 3, 5, 10], {
    appendTo: openControls,
    input,
    maxQty,
    classNames: ['mh-improved-item-qty', 'tiny', 'gray'],
  });

  const openMaxButton = makeElement('a', ['mousehuntActionButton', 'lightBlue', 'tiny', 'mh-improved-shop-buy-max']);
  const openMaxButtonText = makeElement('span', '', 'Max');
  openMaxButton.append(openMaxButtonText);

  let hasMaxed = false;
  openMaxButton.addEventListener('click', () => {
    if (hasMaxed) {
      input.value = 0;
      openMaxButtonText.innerText = 'Max';
    } else {
      input.value = maxQty;
      openMaxButtonText.innerText = 'Reset';
    }

    hasMaxed = ! hasMaxed;
  });

  openControls.append(openMaxButton);

  quantityForm.append(openControls);
};

/**
 * Update the item view.
 */
const updateItemView = async () => {
  const itemView = document.querySelector('.itemViewContainer');
  if (! itemView) {
    return;
  }

  const itemId = itemView.getAttribute('data-item-id');
  if (! itemId) {
    return;
  }

  const sidebar = document.querySelector('.itemView-sidebar');
  if (sidebar) {
    const crafting = document.querySelector('.itemView-action.crafting_item');
    if (crafting) {
      sidebar.append(crafting);
    }

    const smashing = document.querySelector('.itemView-partsContainer');
    if (smashing) {
      sidebar.append(smashing);

      if (! smashing.getAttribute('data-has-changed-title')) {
        const smashingTitle = smashing.querySelector('b');
        if (smashingTitle) {
          smashingTitle.innerText = 'Hunter\'s Hammer to get:';
          smashing.setAttribute('data-has-changed-title', 'true');

          smashing.innerHtml = smashing.innerHTML.replace('If you smash it, you\'ll get:', '');
        }
      }
    }
  }

  const obtainHint = document.querySelector('.itemView-obtainHint');
  const description = document.querySelector('.itemView-description');
  if (obtainHint && description) {
    description.after(obtainHint);
  }

  if (itemView.classList.contains('base') || itemView.classList.contains('weapon') || itemView.classList.contains('skin')) {
    // Replace the image with the full size image.
    const thumbnailContainer = itemView.querySelector('.itemView-thumbnailContainer');
    if (thumbnailContainer) {
      const thumbnail = thumbnailContainer.querySelector('.itemView-thumbnail');
      const fullSize = thumbnailContainer.querySelector('a');
      if (thumbnail && fullSize && fullSize.getAttribute('data-image')) {
        thumbnail.style.backgroundImage = `url(${fullSize.getAttribute('data-image')})`;
        thumbnail.style.backgroundSize = 'contain';
        if (itemView.classList.contains('base')) {
          thumbnail.style.backgroundPositionY = '-100px';
        }
      }
    }
  }

  addLinks(itemId);

  addQuantityButtons(itemView);

  if (! getSetting('better-item-view.show-drop-rates', true)) {
    return;
  }

  // don't show drop rates for items that aren't consistent.
  const id = Number.parseInt(itemId, 10);
  const ignored = [
    2473, // Mina's gift
    823, // party charm
    803, // chrome charm
    420, // king's credits
    1980, // king's keys
    585, // scrambles
    412, // sb supply pack
    2541, // RLC
    2863, // Chrome bits.
  ];

  if (ignored.includes(id)) {
    return;
  }

  let mhctJson = await getArForMouse(itemId, 'item');
  if (! mhctJson || mhctJson === undefined) {
    return;
  }

  itemView.classList.add('mouseview-has-mhct');

  const container = itemView.querySelector('.itemView-padding');
  if (! container) {
    return;
  }

  const arWrapper = makeElement('div', 'ar-wrapper');
  const title = makeElement('div', 'ar-header');
  const titleText = makeElement('div', 'ar-title', 'Drop Rates', title);

  makeTooltip({
    appendTo: titleText,
    text: 'The best location and bait, according to data gathered by <a href="https://mhct.win/" target="_blank" rel="noopener noreferrer">MHCT</a>.',
  });

  const link = makeElement('a', 'ar-link', 'View on MHCT →');
  link.href = `https://api.mouse.rip/mhct-redirect-item/${itemId}`;
  link.target = '_mhct';
  title.append(link);

  arWrapper.append(title);
  const itemsArWrapper = makeElement('div', 'item-ar-wrapper');

  // check if there are stages in any of the item
  const hasStages = mhctJson.some((itemAr) => itemAr.stage);

  if (hasStages) {
    itemsArWrapper.classList.add('has-stages');
  }

  // shrink the mhct json array to only include items with non-zero drop rates and a maximum of 15 items
  mhctJson = mhctJson
    .filter((itemAr) => Number.parseInt(itemAr.drop_pct, 10) > 0)
    .slice(0, 10);

  mhctJson.forEach((itemAr) => {
    const dropPercent = Number.parseInt(itemAr.drop_pct, 10).toFixed(2);
    if (dropPercent !== '0.00') {
      const itemArWrapper = makeElement('div', 'mouse-ar-wrapper');

      makeElement('div', 'location', itemAr.location, itemArWrapper);

      if (hasStages) {
        makeElement('div', 'stage', itemAr.stage, itemArWrapper);
      }

      makeElement('div', 'cheese', itemAr.cheese, itemArWrapper);

      makeElement('div', 'rate', `${dropPercent}%`, itemArWrapper);
      itemsArWrapper.append(itemArWrapper);
    }
  });

  if (mhctJson.length > 0) {
    arWrapper.append(itemsArWrapper);
    container.append(arWrapper);
  }
};

const shortenRecipeGoldHint = () => {
  const layouts = ['layout', 'content', 'actions'];

  layouts.forEach((layout) => {
    onRender({
      group: 'ItemView',
      layout,
      after: true,
      callback: (data, results) => {
        return results
          .replaceAll('gold per piece', 'gold each')
          .replaceAll('One potion converts ', '');
      }
    });
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-item-view');

  if (getSetting('better-item-view.show-item-hover', true)) {
    excludeFromStandaloneUserscript: hoverItem();
  }

  shortenRecipeGoldHint();
  onNavigation(shortenRecipeGoldHint, {
    page: 'inventory',
    tab: 'potions'
  });

  onOverlayChange({ item: { show: updateItemView } });
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-item-view',
  name: 'Better Items',
  type: 'better',
  default: true,
  description: 'Update the styles, show drop rates, and provide links to MHCT and MH Wiki.',
  load: init,
  settings,
};
