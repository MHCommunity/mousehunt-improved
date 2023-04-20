import { addUIStyles } from '../../utils';
import styles from './styles.css';

/**
 * Return a node with links after grabbing the item ID and name from the page.
 *
 * @param {Object} args       Arguments to use for the links.
 * @param {string} args.id    CSS selector for the item ID.
 * @param {string} args.name  CSS selector for the item name.
 * @param {string} args.class CSS class to add to the node.
 *
 * @return {false|string} False if no item ID or name found, otherwise HTML for links.
 */
const getLinksNode = (args) => {
  const itemInfo = document.querySelector(args.id);
  if (! itemInfo) {
    return false;
  }

  const itemID = itemInfo.getAttribute('data-item-id');
  const itemName = document.querySelector(args.name).textContent;
  if (! itemID || ! itemName) {
    return false;
  }

  const existingText = document.querySelector('.mh-item-info-text');
  if (existingText) {
    existingText.remove();
  }

  const newText = document.createElement('div');
  newText.classList.add('mh-item-info-text');

  if (args.class) {
    newText.classList.add(args.class);
  }

  // Add link to the wiki.
  newText.innerHTML = makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${itemName}`);

  // Link to MHCT, either converter or looter.
  const isConvertible = document.querySelector(args.id + ' .itemView-action.convertible');
  newText.innerHTML += (isConvertible && isConvertible.innerText)
    ? makeLink('MHCT Converter', `https://www.mhct.win/converter.php?item=${itemID}&timefilter=all_time`)
    : makeLink('MHCT Looter', `https://www.mhct.win/loot.php?item=${itemID}&timefilter=all_time`);

  // Link to mhdb.
  const mhdbName = itemName.replace(/'/g, '');
  newText.innerHTML += makeLink('mhdb', `https://dbgames.info/mousehunt/items/${mhdbName}`);

  // Link to markethunt.
  const isTradable = document.querySelectorAll('.itemView-sidebar-checklistItem.checked');
  if (args.forceType === 'marketplace' || (isTradable && isTradable.length === 2)) {
    newText.innerHTML += makeLink('Markethunt', `https://markethunt.vsong.ca/index.php?item_id=${itemID}`);
  }

  return newText;
};

/**
 * Append text to a node, either before or after another node.
 *
 * @param {Object} args         Arguments to use for the text.
 * @param {string} args.parent  CSS selector for the parent node.
 * @param {string} args.child   CSS selector for the child node.
 * @param {string} args.content Text to append.
 *
 * @return {Node} The node that was appended to.
 */
const appendText = (args) => {
  const append = document.querySelector(args.parent);
  if (! append) {
    return false;
  }

  if (args.child) {
    const child = document.querySelector(args.child);
    if (child && args.content) {
      return append.insertBefore(args.content, child);
    }
  } else {
    return append.appendChild(args.content);
  }

  return false;
};

/**
 * Add links to the marketplace page for an item.
 */
const addMarketplaceLinks = () => {
  appendText({
    parent: '.marketplaceView-item-titleActions',
    child: '.marketplaceView-userGold',

    content: getLinksNode({
      id: '.marketplaceView-item.view',
      name: '.marketplaceView-item-titleName',
      forceType: 'marketplace',
    })
  });
};

/**
 * Add links to the item popup for an item.
 */
const addItemPopupLinks = () => {
  appendText({
    parent: '.itemView-header-name',
    content: getLinksNode({
      id: '.itemViewContainer',
      name: '.itemView-header-name span',
      class: 'mh-item-info-text-item-popup'
    }),
  });
};

/**
 * Fix item qty bug - see https://greasyfork.org/en/scripts/445926-mousehunt-item-quantity-fix
 */
const fixItemQtyBug = () => {
  // Make sure we have the ID parameter.
  if (window.location.href.indexOf('i.php?id=') === -1) {
    return;
  }

  // Grab the item ID.
  const itemID = window.location.href.split('i.php?id=')[ 1 ];
  if (! itemID) {
    return;
  }

  // Make sure the quantity shown is 0.
  const qty = document.querySelector('.itemView-sidebar-quantity');
  if (! (qty && qty.textContent.indexOf('You Own:') !== -1)) {
    return;
  }

  // Grab the item slug.
  const itemName = document.querySelector('.itemViewContainer').getAttribute('data-item-type');
  if (! itemName) {
    return;
  }

  // redirect to item.php?item_type=itemName
  const newLocation = window.location.href.replaceAll(`i.php?id=${itemID}`, `item.php?item_type=${itemName}`);
  if (newLocation !== window.location.href) {
    window.location.href = newLocation;
  }
};

const main = () => {
  fixItemQtyBug();

  onAjaxRequest(addMarketplaceLinks, 'managers/ajax/users/marketplace.php', true);
  onAjaxRequest(addItemPopupLinks, 'managers/ajax/users/userInventory.php', true);

  // if we're on an item page, add the links.
  if (window.location.href.indexOf('item.php') !== -1) {
    addItemPopupLinks();
  }
};

export default function moduleTemplate() {
  addUIStyles(styles);

  main();
}
