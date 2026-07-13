import { onRender } from '@utils';

import { getItemName, getItemType } from '../items';
import { getSearchTermString } from '../search-terms';

/**
 * Add the search terms to the marketplace's search dropdown.
 *
 * Select2 matches against each option's markup rather than its text, so the terms can be hidden in
 * a span. This is what the game itself already does to make SUPER|brie+ findable by 'SB+'.
 *
 * @param {Object} data The template data for the search terms.
 */
const addSearchTerms = (data) => {
  if (! data?.search_terms) {
    return;
  }

  data.search_terms.forEach((category) => {
    category.terms.forEach((term) => {
      // The game adds its own hidden terms to some items, so don't double up on them.
      if (term.value.includes('class="hidden"')) {
        return;
      }

      const type = getItemType(term.key);
      const terms = getSearchTermString(type, getItemName(type));
      if (terms) {
        term.value = `${term.value}<span class="hidden">${terms}</span>`;
      }
    });
  });
};

/**
 * Initialize the marketplace search.
 */
export default async () => {
  onRender({
    group: 'ViewMarketplace_search_terms',
    before: true,
    callback: addSearchTerms,
  });
};
