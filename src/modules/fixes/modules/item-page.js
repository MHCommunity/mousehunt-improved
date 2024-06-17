import { getCurrentPage, onDialogShow, onNavigation, setMultipleTimeout } from '@utils';

/**
 * Fix the item page.
 */
const fixItemPage = () => {
  if ('item' !== getCurrentPage()) {
    return;
  }

  const currentType = document.querySelector('.itemViewContainer');
  if (! currentType) {
    return;
  }

  // get the classlist as a string.
  const classes = currentType.classList.toString();
  const type = classes.replace('itemViewContainer ', '').split(' ');
  if (! type || ! type[0]) {
    return;
  }

  if (type.includes('message_item')) {
    return;
  }

  const link = document.querySelector(`.itemView-header-classification-link.${type[0]} a`);
  if (! link) {
    return;
  }

  // get the onclick attribute, remove 'hg.views.ItemView.hide()', then set the onclick attribute
  const onclick = link.getAttribute('onclick');
  if (! onclick) {
    return;
  }

  // get the page title and tab via regex
  const page = onclick.match(/setPage\('(.+?)'.+tab:'(.+)'/);
  if (! page) {
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

  if (! itemId) {
    return;
  }

  hg.views.ItemView.show(itemId);

  const item = document.querySelector(`.inventoryPage-item[data-item-type="${itemId}"]`);
  if (item) {
    item.scrollIntoView();
  }
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

  onDialogShow('item', () => {
    const currentHref = window.location.href;

    setMultipleTimeout(() => {
      if (currentHref !== window.location.href) {
        window.history.replaceState(null, '', currentHref);
      }
    }, [10, 100, 500, 1000]);
  });
};
