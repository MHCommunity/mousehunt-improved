import { onNavigation, onRequest } from '@utils';

import { getItemName } from '../items';
import { getSearchTermString } from '../search-terms';

/**
 * Add the search terms to the items on the inventory page.
 *
 * The game's own inventory search matches against `data-name`, so the terms have to be appended to
 * it. Better Inventory copies `data-name` into the visible item name and sorts on it, so the
 * untouched name is stashed in `data-mhui-name` for it to read instead.
 */
const addSearchTerms = () => {
  const items = document.querySelectorAll('.inventoryPage-item:not([data-mhui-search])');

  items.forEach((item) => {
    item.setAttribute('data-mhui-search', 'true');

    const name = item.getAttribute('data-name');
    const type = item.getAttribute('data-item-type');
    if (!name || !type) {
      return;
    }

    const terms = [getSearchTermString(type, name)];

    // Recipes and potions are worth finding by what they make and not just by their own name, so
    // that searching for 'ESB' turns up the recipe for it as well as the cheese itself. An unknown
    // type resolves to no name and so contributes no terms. A recipe can produce several items, in
    // which case data-produced-item is a comma-separated list, so add terms for each one.
    const produced = item.getAttribute('data-produced-item');
    if (produced) {
      produced
        .split(',')
        .map((producedType) => producedType.trim())
        .filter(Boolean)
        .forEach((producedType) => {
          terms.push(getSearchTermString(producedType, getItemName(producedType)));
        });
    }

    const searchTerms = terms.filter(Boolean).join(' ');
    if (searchTerms) {
      item.setAttribute('data-mhui-name', name);
      item.setAttribute('data-name', `${name} ${searchTerms}`);
    }
  });
};

/**
 * Initialize the inventory search.
 */
export default async () => {
  onNavigation(addSearchTerms, { page: 'inventory' });

  // The inventory swaps tabs without navigating, so re-tag whenever it re-renders.
  onRequest('pages/page.php', addSearchTerms);
};
