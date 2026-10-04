import { makeElement, onNavigation } from '@utils';

import { getSearchTermString } from '../search-terms';

/**
 * Add the search terms to the items on the Send Supplies page.
 *
 * Better Send Supplies provides the search box here and matches on each item's text content, so the
 * terms just need to be somewhere inside the item and out of sight.
 */
const addSearchTerms = () => {
  const items = document.querySelectorAll('#supplytransfer .tabContent.item .listContainer .item:not([data-mhui-search])');

  items.forEach((element) => {
    element.setAttribute('data-mhui-search', 'true');

    const item = $(element).data()?.item;
    if (!item?.type || !item?.name) {
      return;
    }

    const terms = getSearchTermString(item.type, item.name);
    if (terms) {
      makeElement('span', 'mhui-search-terms', terms, element);
    }
  });
};

/**
 * Initialize the Send Supplies search.
 */
export default async () => {
  onNavigation(addSearchTerms, { page: 'supplytransfer' });
};
