import { onRender } from '@utils';

import { addSearchTermsToName, removeSearchTerms } from '../search-terms';

/**
 * The templates that render a component's name, and so need the search terms stripped back out.
 */
const templates = ['tag_groups', 'item', 'item_armed', 'item_favourite'];

/**
 * Add the search terms to a single trap component.
 *
 * @param {Object} component The trap component.
 */
const addSearchTermsToComponent = (component) => {
  if (component?.type && component?.name) {
    component.name = addSearchTermsToName(component.type, component.name);
  }
};

/**
 * Add the search terms to the trap components in a response.
 *
 * The trap selector filters on a substring of the component's name, and the list it filters is
 * built straight from these responses, so the terms have to be in place before the view stores it.
 *
 * @param {Object} response The response to add the terms to.
 */
const addSearchTermsToResponse = (response) => {
  if (Array.isArray(response?.components)) {
    response.components.forEach((component) => addSearchTermsToComponent(component));
  }

  if (response?.inventory) {
    Object.values(response.inventory).forEach((component) => addSearchTermsToComponent(component));
  }
};

/**
 * Tag the trap components as they come back from the game.
 *
 * `onRequest` only sees a copy of the response, so it can't be used to change what the view stores.
 */
const interceptComponents = () => {
  $.ajaxPrefilter((options, originalOptions) => {
    if (
      ! options.url.includes('users/gettrapcomponents.php') &&
      ! options.url.includes('users/changetrap.php')
    ) {
      return;
    }

    const parentSuccess = options.success || originalOptions.success;
    const parentAjax = options.ajax;

    const success = (response) => {
      addSearchTermsToResponse(response);

      // Changing a trap wraps its success handler in something that never resolves on its own, so
      // it has to be called directly rather than through the handler above.
      if (parentAjax) {
        return parentAjax.ondone(response);
      }

      if ('function' === typeof parentSuccess) {
        return parentSuccess(response);
      }
    };

    options.success = success;
    originalOptions.success = success;
  });
};

const tooltipObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const title = mutation.target.querySelector?.('b');
    if (title) {
      title.textContent = removeSearchTerms(title.textContent);
    }
  });
});

/**
 * Watch the item tooltip for the search terms.
 *
 * The tooltip writes the component's name straight to the DOM rather than going through a template,
 * so it's the one place the terms can't be stripped at render.
 */
const observeTooltip = () => {
  const tooltip = document.querySelector('.campPage-trap-itemBrowser-itemDescriptionHover');
  if (! tooltip) {
    return;
  }

  tooltipObserver.disconnect();
  tooltipObserver.observe(tooltip, { childList: true, subtree: true });
};

/**
 * Initialize the trap selector search.
 */
export default async () => {
  interceptComponents();

  templates.forEach((layout) => {
    onRender({
      group: 'TrapSelectorView',
      layout,
      after: true,
      callback: (data, results) => {
        observeTooltip();

        return removeSearchTerms(results);
      },
    });
  });
};
