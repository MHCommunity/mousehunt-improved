import { addStyles, makeElement, onEvent, onRequest } from '@utils';

import styles from './styles.css';

const addItemToQuickLinks = (link, appendTo, filter, sortDropdown) => {
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

  item.addEventListener('click', (e) => {
    e.preventDefault();

    // If it's already active, remove it.
    if (e.target.classList.contains('active')) {
      // Update the filter to not filter by this.
      hiddenInput.value = 'sortBy' === filter ? 'default' : 'no_tag_selected';
      e.target.classList.remove('active');
    } else {
      // Otherwise, update the filter to filter by this.
      hiddenInput.value = link.id;
      e.target.classList.add('active');
    }

    app.pages.CampPage.updateFilter(hiddenInput);
    if (sortDropdown) {
      sortDropdown.value = link.id;
    }
  });

  appendTo.append(item);
};

const addQuickLinksToTrap = () => {
  const itemBrowser = document.querySelector('.campPage-trap-itemBrowser');
  if (! itemBrowser) {
    return;
  }

  const type = itemBrowser.classList.value.replace('campPage-trap-itemBrowser', '').trim();
  if (! type) {
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
    { id: 'power', name: 'Power', image: 'https://www.mousehuntgame.com/images/ui/camp/trap/stat_power.png?asset_cache_version=2' },
    { id: 'power_bonus', name: 'Power Bonus', image: 'https://www.mousehuntgame.com/images/ui/camp/trap/stat_power_bonus.png?asset_cache_version=2' },
    { id: 'luck', name: 'Luck', image: 'https://www.mousehuntgame.com/images/ui/camp/trap/stat_luck.png?asset_cache_version=2' },
    { id: 'attraction_bonus', name: 'Attraction Bonus', image: 'https://www.mousehuntgame.com/images/ui/camp/trap/stat_attraction_bonus.png?asset_cache_version=2' },
    { id: 'name', name: 'Name', image: 'https://i.mouse.rip/sort-a-z-icon.png' }
  ];

  if ('bait' === type || 'trinket' === type) {
    links.push({ id: 'quantity', name: 'Quantity', image: 'https://i.mouse.rip/sort-qty-icon.png' });
  }

  const sortByInput = document.querySelector('.campPage-trap-itemBrowser-filter.sortBy select');
  links.forEach((link) => {
    addItemToQuickLinks(link, quickLinks, 'sortBy', sortByInput);
  });

  favorites.parentNode.insertBefore(quickLinks, favorites.nextSibling);

  if ('weapon' === type) {
    const powerQuickLinks = document.createElement('div');
    powerQuickLinks.classList.add('campPage-trap-itemBrowser-quickLinks', 'campPage-trap-itemBrowser-quickLinks-power');

    makeElement('div', ['campPage-trap-itemBrowser-quickLinks-header', 'filter-header'], 'Filter', powerQuickLinks);

    const powerLinks = [
      { id: 'arcane', name: 'Arcane', image: 'https://www.mousehuntgame.com/images/powertypes/arcane.png?asset_cache_version=2' },
      { id: 'draconic', name: 'Draconic', image: 'https://www.mousehuntgame.com/images/powertypes/draconic.png?asset_cache_version=2' },
      { id: 'forgotten', name: 'Forgotten', image: 'https://www.mousehuntgame.com/images/powertypes/forgotten.png?asset_cache_version=2' },
      { id: 'hydro', name: 'Hydro', image: 'https://www.mousehuntgame.com/images/powertypes/hydro.png?asset_cache_version=2' },
      { id: 'law', name: 'Law', image: 'https://www.mousehuntgame.com/images/powertypes/law.png?asset_cache_version=2' },
      { id: 'physical', name: 'Physical', image: 'https://www.mousehuntgame.com/images/powertypes/physical.png?asset_cache_version=2' },
      { id: 'rift', name: 'Rift', image: 'https://www.mousehuntgame.com/images/powertypes/rift.png?asset_cache_version=2' },
      { id: 'shadow', name: 'Shadow', image: 'https://www.mousehuntgame.com/images/powertypes/shadow.png?asset_cache_version=2' },
      { id: 'tactical', name: 'Tactical', image: 'https://www.mousehuntgame.com/images/powertypes/tactical.png?asset_cache_version=2' },
    ];

    const powerInput = document.querySelector('.campPage-trap-itemBrowser-filter.powerType select');
    powerLinks.forEach((link) => {
      addItemToQuickLinks(link, powerQuickLinks, 'powerType', powerInput);
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

const main = () => {
  addQuickLinksToTrap();
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  onRequest(main, 'ajax/users/gettrapcomponents.php');
  onEvent('camp_page_toggle_blueprint', main);
};

export default {
  id: 'quick-filters-and-sort',
  name: 'Quick Filters and Sort',
  type: 'feature',
  default: true,
  description: 'Add quick filters and sorting to the trap, base, charm, and cheese selectors.',
  load: init,
};
