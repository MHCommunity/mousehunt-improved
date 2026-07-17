import { getCurrentPage, onDialogHide, onDialogShow, onNavigation, setMultipleTimeout } from '@utils';

/**
 * Fix the item page.
 */
const fixItemPage = () => {
  if ('item' !== getCurrentPage()) {
    return;
  }

  const currentType = document.querySelector('.itemViewContainer');
  if (!currentType) {
    return;
  }

  // get the classlist as a string.
  const classes = currentType.classList.toString();
  const type = classes.replace('itemViewContainer ', '').split(' ');
  if (!type || !type[0]) {
    return;
  }

  if (type.includes('message_item')) {
    return;
  }

  const link = document.querySelector(`.itemView-header-classification-link.${type[0]} a`);
  if (!link) {
    return;
  }

  // get the onclick attribute, remove 'hg.views.ItemView.hide()', then set the onclick attribute
  const onclick = link.getAttribute('onclick');
  if (!onclick) {
    return;
  }

  // get the page title and tab via regex
  const page = onclick.match(/setPage\('(.+?)'.+tab:'(.+)'/);
  if (!page) {
    return;
  }

  const pageTitle = page[1];
  let tab = page[2];
  let subtab = null;

  if ('skin' === tab || 'trinket' === tab) {
    subtab = tab;
    tab = 'traps';
  }

  // build the url
  let url = `https://www.mousehuntgame.com/${pageTitle.toLowerCase()}.php?tab=${tab}`;
  if (subtab) {
    url += `&sub_tab=${subtab}`;
  }

  // Append a query string with the item ID so we can process it after the page loads.
  const itemType = currentType.getAttribute('data-item-type');
  url += `&viewing-item-id=${itemType}`;

  // Redirect away from the item page.
  window.location = url;
};

/**
 * When the inventory page loads, check for the item ID in the query string and show the item.
 */
const fixItemPageReceiver = () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('viewing-item-id');

  if (!itemId) {
    return;
  }

  hg.views.ItemView.show(itemId);

  const item = document.querySelector(`.inventoryPage-item[data-item-type="${itemId}"]`);
  if (item) {
    item.scrollIntoView();
  }
};

let previousUrl = null;

/**
 * While the item dialog is open, set the URL to the item's permalink.
 */
const updateUrlForItemDialog = () => {
  const originalUrl = window.location.href;

  setMultipleTimeout(() => {
    const itemView = document.querySelector('.itemViewContainer');
    if (!itemView) {
      return;
    }

    const itemType = itemView.getAttribute('data-item-type');
    const itemId = itemView.getAttribute('data-item-id');

    let url;
    if (itemType) {
      url = `https://www.mousehuntgame.com/item.php?item_type=${itemType}`;
    } else if (itemId) {
      url = `https://www.mousehuntgame.com/i.php?id=${itemId}`;
    } else {
      return;
    }

    if (window.location.href === url) {
      return;
    }

    // Only save the original URL on the first item view, so opening another
    // item from within the dialog doesn't overwrite it with an item permalink.
    if (null === previousUrl) {
      previousUrl = originalUrl;
    }

    window.history.replaceState(null, '', url);
  }, [10, 100, 500]);
};

/**
 * When the item dialog closes, restore the URL it replaced.
 */
const restoreUrlAfterItemDialog = () => {
  if (null === previousUrl) {
    return;
  }

  const currentHref = window.location.href;
  if (currentHref.includes('item.php?item_type=') || currentHref.includes('i.php?id=')) {
    window.history.replaceState(null, '', previousUrl);
  }

  previousUrl = null;
};

/**
 * Initialize the item page fixes.
 */
export default async () => {
  if ('item' === getCurrentPage()) {
    fixItemPage();
  }

  onNavigation(fixItemPage, {
    page: 'item',
    onLoad: true,
  });

  onNavigation(fixItemPageReceiver, {
    page: 'inventory',
    anyTab: true,
    anySubtab: true,
    onLoad: true,
  });

  onDialogShow('item', updateUrlForItemDialog);
  onDialogHide(restoreUrlAfterItemDialog);
};
