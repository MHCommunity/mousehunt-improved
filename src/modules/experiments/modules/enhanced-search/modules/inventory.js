import { onNavigation, onRequest } from '@utils';

import { getItemName } from '../items';
import { getSearchTermString } from '../search-terms';

/**
 * Add the search terms to the items on the inventory page.
 *
 * The game's own inventory search matches against `data-name`, which is never displayed, so the
 * terms can just be appended to it.
 */
const addSearchTerms = () => {
  const items = document.querySelectorAll('.inventoryPage-item:not([data-mhui-search])');

  items.forEach((item) => {
    item.setAttribute('data-mhui-search', 'true');

    const name = item.getAttribute('data-name');
    const type = item.getAttribute('data-item-type');
    if (! name || ! type) {
      return;
    }

    const terms = [getSearchTermString(type, name)];

    // Recipes and potions are worth finding by what they make and not just by their own name, so
    // that searching for 'ESB' turns up the recipe for it as well as the cheese itself. An unknown
    // type resolves to no name and so contributes no terms.
    const produced = item.getAttribute('data-produced-item');
    if (produced) {
      terms.push(getSearchTermString(produced, getItemName(produced)));
    }

    const searchTerms = terms.filter(Boolean).join(' ');
    if (searchTerms) {
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
