import {
  addStyles,
  getArForMouse,
  getData,
  getSetting,
  makeElement,
  makeLink,
  makeMathButtons,
  makeMhButton,
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

let items;
const updateForAirshipParts = async (itemId, itemView) => {
  if (! items) {
    items = await getData('items');
  }

  if (! items) {
    return;
  }

  const item = items.find((i) => i.id === Number.parseInt(itemId, 10));
  if (! item || ! item.is_airship_part || ! item.airship_part_type) {
    return;
  }

  const thumbnail = itemView.querySelector('.itemView-thumbnail');
  if (! thumbnail) {
    return;
  }

  thumbnail.classList.add('mh-improved-airship-part-container');

  const els = {
    hull: makeElement('div', ['mh-improved-airship-part', 'hull', 'silhouette']),
    sail: makeElement('div', ['mh-improved-airship-part', 'sail', 'silhouette']),
    balloon: makeElement('div', ['mh-improved-airship-part', 'balloon', 'silhouette']),
  };

  els[item.airship_part_type].classList.remove('silhouette');
  els[item.airship_part_type].style.backgroundImage = `url(${item.images.large})`;

  thumbnail.append(els.hull);
  thumbnail.append(els.sail);
  thumbnail.append(els.balloon);
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

  const maxQty = Number.parseInt(quantity[1].trim().replaceAll(',', ''), 10);

  const openControls = makeElement('div', ['mh-improved-item-open-controls']);

  makeMathButtons([1, 3, 5, 10], {
    appendTo: openControls,
    input,
    maxQty,
    classNames: ['mh-improved-item-qty', 'tiny', 'lightBlue'],
  });

  const openMaxButton = makeMhButton({
    text: 'Max',
    className: ['mh-improved-shop-buy-max', 'lightBlue'],
    appendTo: openControls,
  });

  let hasMaxed = false;
  openMaxButton.addEventListener('click', () => {
    const openMaxButtonText = openMaxButton.querySelector('span');
    if (hasMaxed) {
      input.value = 0;
      openMaxButtonText.innerText = 'Max';
    } else {
      input.value = maxQty <= 200 ? maxQty : 200;
      openMaxButtonText.innerText = 'Reset';
    }

    hasMaxed = ! hasMaxed;
  });

  quantityForm.append(openControls);
};

const showDropRates = async (itemId, itemView) => {
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
    text: 'The best location and bait, according to data gathered by <a href="https://mhct.win/" target="_blank" rel="noreferrer">MHCT</a>.',
  });

  const link = makeElement('a', 'ar-link', 'View on MHCT →');
  link.href = `https://api.mouse.rip/mhct-redirect-item/${itemId}`;
  link.target = '_blank';
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

const maybeShowMiceOnMapLink = async (itemId, itemView) => {
  if (! items) {
    items = await getData('items');
  }

  const item = items.find((i) => i.id === Number.parseInt(itemId, 10));
  if (! (item && 'convertible' === item?.classification && item?.tags?.includes('scroll_case'))) {
    return;
  }

  const scrollsToMaps = await getData('scrolls-to-maps');
  if (! scrollsToMaps || ! scrollsToMaps[item.type] || ! scrollsToMaps[item.type].length) {
    return;
  }

  const itemViewDescription = itemView.querySelector('.itemView-description');
  if (! itemViewDescription) {
    return;
  }

  const mapLink = makeElement('div', 'mh-improved-scroll-to-map');
  const singleMap = scrollsToMaps[item.type].length === 1;

  if (singleMap) {
    const map = scrollsToMaps[item.type][0];
    if (! map.name || ! map.mhctId) {
      mapLink.remove();
      return;
    }
  }

  const title = makeElement('div', 'mh-improved-scroll-to-map-multiple');
  makeElement('strong', 'mh-improved-scroll-to-map-title-text', 'Maps for this scroll case:', title);

  const tooltip = makeElement('div', ['PreferencesPage__blackTooltip', 'mh-improved-tooltip']);
  makeElement('span', 'PreferencesPage__blackTooltipText', 'Click the map to view the possible mice on MHCT.', tooltip);
  title.append(tooltip);

  mapLink.append(title);

  // TODO: update these.
  // these have multiple but are based on rank, so we only want to show the correct one.
  // chrome_boss_scroll_case_convertible
  // rainbow_scroll_case_convertible
  // party_size_rainbow_scroll_case_convertible
  // toxic_scroll_case_convertible

  const mapList = makeElement('ul', 'mh-improved-scroll-to-map-multiple-list');
  let hasShownMaps = false;
  scrollsToMaps[item.type].forEach((map) => {
    if (! map.name || ! map.mhctId) {
      return;
    }

    hasShownMaps = true;

    const listItem = makeElement('li', 'mh-improved-scroll-to-map-multiple-list-item');
    const link = makeElement('a', 'mh-improved-scroll-to-map-link', map.name);
    link.href = `https://www.mhct.win/mapper.php?item=${map.mhctId}`;
    link.target = '_blank';
    listItem.append(link);
    mapList.append(listItem);
  });

  if (! hasShownMaps) {
    mapLink.remove();
    return;
  }

  mapLink.append(mapList);

  itemViewDescription.append(mapLink);
};

const updateDescription = (itemView) => {
  const toTruncate = [
    ['Upon opening this scroll case and completing the Gilded', '<b>A great way to share the Lucky Golden Shield with friends!</b>'],
    ['Upon opening this case and completing the Chrome Treasure Map', '<b>• Chrome Journal Theme Scrap</b><br>'],
  ];

  const description = itemView.querySelector('.itemView-description');
  if (! description) {
    return;
  }

  let text = description.innerHTML;

  toTruncate.forEach(([start, end]) => {
    const startIndex = text.indexOf(start);
    const endIndex = text.indexOf(end);

    // Ensure both start and end are found and end appears after start
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      // Remove the text between start and end, including the start and end text
      text = text.slice(0, Math.max(0, startIndex)) + text.slice(Math.max(0, endIndex + end.length));
    }
  });

  // Update the description content with the modified text
  description.innerHTML = text;
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

  updateDescription(itemView);

  addLinks(itemId);
  addQuantityButtons(itemView);
  updateForAirshipParts(itemId, itemView);

  if (getSetting('better-item-view.show-drop-rates', true)) {
    showDropRates(itemId, itemView);
  }

  await maybeShowMiceOnMapLink(itemId, itemView);
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
const init = () => {
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
