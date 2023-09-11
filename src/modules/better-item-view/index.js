import { addUIStyles, getArForMouse } from '../utils';
import styles from './styles.css';

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text          Text to use for link.
 * @param {string}  href          URL to link to.
 * @param {boolean} encodeAsSpace Encode spaces as %20.
 *
 * @return {string} HTML for link.
 */
const makeLink = (text, href, encodeAsSpace) => {
  if (encodeAsSpace) {
    href = href.replace(/_/g, '%20');
  } else {
    href = href.replace(/\s/g, '_');
  }

  href = href.replace(/\$/g, '_');

  return `<a href="${href}" target="_mouse" class="mousehuntActionButton tiny"><span>${text}</span></a>`;
};

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
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}`) +
    makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${name}`);
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
  title.appendChild(div);

  // Move the values into the main text.
  const values = document.querySelector('.mouseView-values');
  const desc = document.querySelector('.mouseView-descriptionContainer');
  if (values && desc) {
    // insert as first child of desc
    desc.insertBefore(values, desc.firstChild);
  }
};

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
      // move the crafting item to the sidebar
      sidebar.appendChild(crafting);
    }
  }

  addLinks(itemId);

  // dont show drop rates for items that arent consistent.
  const id = parseInt(itemId, 10);
  if (
    2473 === id || // mina's gift
    823 === id // party charm
  ) {
    return;
  }

  let mhctjson = await getArForMouse(itemId, 'item');
  if (! mhctjson || typeof mhctjson === 'undefined') {
    return;
  }

  itemView.classList.add('mouseview-has-mhct');

  const container = itemView.querySelector('.itemView-padding');
  if (! container) {
    return;
  }

  const arWrapper = makeElement('div', 'ar-wrapper');
  const title = makeElement('div', 'ar-header');
  makeElement('div', 'ar-title', 'Drop Rates', title);

  const link = makeElement('a', 'ar-link', 'View on MHCT →');
  link.href = `https://www.mhct.win/loot.php?item=${itemId}`;
  title.appendChild(link);

  arWrapper.appendChild(title);
  const itemsArWrapper = makeElement('div', 'item-ar-wrapper');

  // check if there are stages in any of the item
  const hasStages = mhctjson.some((itemAr) => itemAr.stage);

  if (hasStages) {
    itemsArWrapper.classList.add('has-stages');
  }

  // shrink the mhctjson array to only include items with non-zero drop rates and a maxiumum of 15 items
  mhctjson = mhctjson.filter((itemAr) => parseInt(itemAr.drop_pct, 10) > 0).slice(0, 15);

  mhctjson.forEach((itemAr) => {
    const dropPercent = parseInt(itemAr.drop_pct, 10).toFixed(2);
    if (dropPercent !== '0.00') {
      const itemArWrapper = makeElement('div', 'mouse-ar-wrapper');

      makeElement('div', 'location', itemAr.location, itemArWrapper);

      if (hasStages) {
        makeElement('div', 'stage', itemAr.stage, itemArWrapper);
      }

      makeElement('div', 'cheese', itemAr.cheese, itemArWrapper);

      makeElement('div', 'rate', `${dropPercent}%`, itemArWrapper);
      itemsArWrapper.appendChild(itemArWrapper);
    }
  });

  arWrapper.appendChild(itemsArWrapper);
  container.appendChild(arWrapper);
};

const main = () => {
  onOverlayChange({ item: { show: updateItemView } });

  onPageChange({ item: { show: updateItemView } });

  if ('item' === getCurrentPage()) {
    updateItemView();
  }
};

export default function itemLinks() {
  addUIStyles(styles);

  main();
}
