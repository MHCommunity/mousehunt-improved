import {
  addStyles,
  getArForMouse,
  getSetting,
  makeElement,
  makeLink,
  makeTooltip,
  onOverlayChange,
  onPageChange
} from '@utils';

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
  return makeLink('MHCT', `https://www.mhct.win/loot.php?item=${id}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}`);
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

      if (smashing.getAttribute('data-has-changed-title')) {
        return;
      }

      const smashingTitle = smashing.querySelector('b');
      if (smashingTitle) {
        smashingTitle.innerText = 'Hunter\'s Hammer to get:';
        smashing.setAttribute('data-has-changed-title', 'true');

        smashing.innerHtml = smashing.innerHTML.replace('If you smash it, you\'ll get:', '');
      }
    }
  }

  addLinks(itemId);

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
  link.href = `https://www.mhct.win/loot.php?item=${itemId}`;
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

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-item-view');
  onOverlayChange({ item: { show: updateItemView } });
  onPageChange({ item: { show: updateItemView } });
};

export default {
  id: 'better-item-view',
  name: 'Better Item View',
  type: 'better',
  default: true,
  description: 'Updates the styles and shows drop rates, links to MHCT, and MH Wiki.',
  load: init,
  settings,
};
