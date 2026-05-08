import {
  addStyles,
  getSetting,
  makeElement,
  onEvent,
  onRequest
} from '@utils';

import styles from './styles.css';

/**
 * Add an element to the quick links.
 *
 * @param {Object}  link                 The link object.
 * @param {Element} appendTo             The element to append to.
 * @param {string}  filter               The filter type.
 * @param {Object}  [inputs]             Optional cached inputs.
 * @param {Element} [inputs.filterInput] Cached filter input element.
 * @param {Element} [inputs.sortInput]   Cached sort input element.
 */
const addItemToQuickLinks = (link, appendTo, filter, inputs) => {
  const existing = document.querySelector(`.campPage-trap-itemBrowser-favorite-item.quicklinks-filter.quicklinks-filter-${filter}-${link.id}`);
  if (existing) {
    existing.remove();
  }

  const item = document.createElement('div');
  item.classList.add('campPage-trap-itemBrowser-favorite-item', 'quicklinks-filter', `quicklinks-filter-${filter}-${link.id}`);

  const itemAnchor = document.createElement('a');
  itemAnchor.classList.add('campPage-trap-itemBrowser-favorite-item-image');
  itemAnchor.setAttribute('href', '#');
  itemAnchor.setAttribute('title', filter === 'sortBy' ? `Sort by ${link.name}` : `Filter by ${link.name}`);
  itemAnchor.style.backgroundImage = `url(${link.image})`;

  const frame = document.createElement('div');
  frame.classList.add('campPage-trap-itemBrowser-favorite-item-image-frame');

  itemAnchor.append(frame);

  const hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('data-filter', filter);
  hiddenInput.setAttribute('value', link.id);
  item.append(itemAnchor);
  item.append(hiddenInput);

  const filterInput = inputs?.filterInput || document.querySelector('.campPage-trap-itemBrowser-filter.powerType select');
  const sortInput = inputs?.sortInput || document.querySelector('.campPage-trap-itemBrowser-filter.sortBy select');

  item.addEventListener('click', (e) => {
    e.preventDefault();

    const input = filter === 'sortBy' ? sortInput : filterInput;

    let reset = false;
    if (item.getAttribute('data-selected') === 'true') {
      // reset the filter to the default
      reset = true;
      item.setAttribute('data-selected', false);
    } else {
      // reset all other filters
      const items = document.querySelectorAll('.quicklinks-filter[data-selected="true"]');
      items.forEach((i) => {
        i.setAttribute('data-selected', false);
      });

      item.setAttribute('data-selected', true);
    }

    let option;

    if (reset) {
      if (filter === 'sortBy') {
        option = input.querySelector('option[value="default"]');
      } else if (filter === 'powerType') {
        option = input.querySelector('option[value="no_tag_selected"]');
      }
    } else {
      option = input.querySelector(`option[value="${link.id}"]`);
    }

    if (option) {
      option.selected = true;
      input.dispatchEvent(new Event('change'));
    }
  });

  appendTo.append(item);
};

/**
 * Add quick links to the trap selector.
 */
const addQuickLinksToTrap = async () => {
  const itemBrowser = document.querySelector('.trapSelectorView__itemBrowserContainer');
  if (! itemBrowser) {
    return;
  }

  const type = itemBrowser.classList.value
    .replaceAll('trapSelectorView__itemBrowserContainer', '')
    .replaceAll('trapSelectorView__outerBlock', '')
    .replaceAll('campPage-trap-itemBrowser', '')
    .replaceAll(' ', '')
    .trim();

  if (! type || 'bai' === type) {
    return;
  }

  itemBrowser.parentNode.parentNode.setAttribute('data-blueprint-type', type);

  const favorites = document.querySelector('.campPage-trap-itemBrowser-favorites');
  if (! favorites) {
    return;
  }

  const existing = document.querySelector('.campPage-trap-itemBrowser-quickLinks');
  if (existing) {
    existing.remove();
  }

  const existingPower = document.querySelector('.campPage-trap-itemBrowser-quickLinks-power');
  if (existingPower) {
    existingPower.remove();
  }

  const quickLinks = document.createElement('div');
  quickLinks.classList.add('campPage-trap-itemBrowser-quickLinks');

  makeElement('div', 'campPage-trap-itemBrowser-quickLinks-header', 'Sort', quickLinks);

  const links = [
    {
      id: 'power',
      name: 'Power',
      image:
				'https://www.mousehuntgame.com/images/ui/camp/trap/stat_power.png',
    },
    {
      id: 'power_bonus',
      name: 'Power Bonus',
      image:
				'https://www.mousehuntgame.com/images/ui/camp/trap/stat_power_bonus.png',
    },
    {
      id: 'luck',
      name: 'Luck',
      image:
				'https://www.mousehuntgame.com/images/ui/camp/trap/stat_luck.png',
    },
    {
      id: 'attraction_bonus',
      name: 'Attraction Bonus',
      image:
				'https://www.mousehuntgame.com/images/ui/camp/trap/stat_attraction_bonus.png',
    },
    {
      id: 'name',
      name: 'Name',
      image: getSetting('native-dark-mode', false) ? 'https://i.mouse.rip/sort-a-z-icon-dark-mode.png' : 'https://i.mouse.rip/sort-a-z-icon.png',
    },
  ];

  if ('trinket' === type) {
    links.push({ id: 'quantity', name: 'Quantity', image: getSetting('native-dark-mode', false) ? 'https://i.mouse.rip/sort-qty-icon-dark-mode.png' : 'https://i.mouse.rip/sort-qty-icon.png' });
  }

  const sortByInput = document.querySelector('.campPage-trap-itemBrowser-filter.sortBy select');
  links.forEach((link) => {
    addItemToQuickLinks(link, quickLinks, 'sortBy', { sortInput: sortByInput });
  });

  favorites.parentNode.insertBefore(quickLinks, favorites.nextSibling);

  if ('weapon' === type) {
    const powerQuickLinks = document.createElement('div');
    powerQuickLinks.classList.add('campPage-trap-itemBrowser-quickLinks', 'campPage-trap-itemBrowser-quickLinks-power');

    makeElement('div', ['campPage-trap-itemBrowser-quickLinks-header', 'filter-header'], 'Filter', powerQuickLinks);

    const powerLinks = [
      {
        id: 'arcane',
        name: 'Arcane',
        image:
					'https://www.mousehuntgame.com/images/powertypes/arcane.png',
      },
      {
        id: 'draconic',
        name: 'Draconic',
        image:
					'https://www.mousehuntgame.com/images/powertypes/draconic.png',
      },
      {
        id: 'forgotten',
        name: 'Forgotten',
        image:
					'https://www.mousehuntgame.com/images/powertypes/forgotten.png',
      },
      {
        id: 'hydro',
        name: 'Hydro',
        image:
					'https://www.mousehuntgame.com/images/powertypes/hydro.png',
      },
      {
        id: 'law',
        name: 'Law',
        image:
					'https://www.mousehuntgame.com/images/powertypes/law.png',
      },
      {
        id: 'physical',
        name: 'Physical',
        image:
					'https://www.mousehuntgame.com/images/powertypes/physical.png',
      },
      {
        id: 'rift',
        name: 'Rift',
        image:
					'https://www.mousehuntgame.com/images/powertypes/rift.png',
      },
      {
        id: 'shadow',
        name: 'Shadow',
        image:
					'https://www.mousehuntgame.com/images/powertypes/shadow.png',
      },
      {
        id: 'tactical',
        name: 'Tactical',
        image:
					'https://www.mousehuntgame.com/images/powertypes/tactical.png',
      },
    ];

    const powerInput = document.querySelector('.campPage-trap-itemBrowser-filter.powerType select');
    powerLinks.forEach((link) => {
      addItemToQuickLinks(link, powerQuickLinks, 'powerType', { filterInput: powerInput });
    });

    // append as a sibling below the quick links
    quickLinks.parentNode.insertBefore(powerQuickLinks, quickLinks.nextSibling);
  } else {
    const powerQuickLinks = document.querySelector('.campPage-trap-itemBrowser-quickLinks-power');
    if (powerQuickLinks) {
      powerQuickLinks.remove();
    }
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'quick-filters-and-sort');

  onRequest('users/gettrapcomponents.php', addQuickLinksToTrap);
  onEvent('camp_page_toggle_blueprint', addQuickLinksToTrap);
};

/**
 * Initialize the module.
 */
export default {
  id: 'quick-filters-and-sort',
  name: 'Quick Filters and Sort',
  type: 'feature',
  default: true,
  description: 'Add quick filters and sorting to the trap, base, charm, and cheese selectors.',
  load: init,
};
