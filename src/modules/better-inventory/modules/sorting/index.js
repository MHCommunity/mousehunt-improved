import { addStyles, doEvent, doRequest, getCurrentPage, getData, getSetting, make, onNavigation, onRequest, saveSetting } from '@utils';

import styles from './styles.css';

const gameImage = (path) => `https://www.mousehuntgame.com/images/${path}`;

const cheeseEffectValues = {
  'Uber Fresh': 13,
  'Ultim. Fresh': 12,
  'Ultimately Fresh': 12,
  'Insanely Fresh': 11,
  'Extrmly. Fresh': 10,
  'Extremely Fresh': 10,
  'Very Fresh': 9,
  Fresh: 8,
  'No Effect': 7,
  Stale: 6,
  'Very Stale': 5,
  'Extrmly. Stale': 4,
  'Extremely Stale': 4,
  'Insanely Stale': 3,
  'Ultim. Stale': 2,
  'Uber Stale': 1,
};

const powerTypes = ['arcane', 'draconic', 'forgotten', 'hydro', 'law', 'physical', 'rift', 'shadow', 'tactical'];

const componentSubtabs = new Set(['weapon', 'base', 'trinket']);

// Subtabs where reordering would fight the game's own layout.
const skippedSubtabs = new Set(['recipe', 'crafting_table']);

// The trap component each subtab holds, for the trap selector's area tags and recommendations.
const trapClassifications = { weapon: 'weapon', base: 'base', skin: 'skin', trinket: 'trinket' };

// Subtabs without the area sidebar, which get an area dropdown instead.
const areaSubtabs = new Set(['weapon', 'base', 'skin']);

// Tags the trap selector leaves out of its Show dropdown.
const hiddenTags = new Set(['charm_weak', 'charm_strong', 'charm_epic', 'charm_rare', 'trap_parts', 'bait_standard', 'event']);

// Area tags and recommendations by item type, and the trap data loaded for each classification.
const trapItems = new Map();
const trapData = new Map();

let itemsByType = new Map();
let titleOrder = new Map();
let specialTypes = new Set();

// Filters only live for the current page view; sorts are remembered per subtab.
const filterState = new Map();

/**
 * Get the saved sort for a subtab.
 *
 * @param {string} key The subtab key.
 *
 * @return {Object|null} The sort type and order.
 */
const getSavedSort = (key) => {
  return getSetting('better-inventory.sort-state', {})?.[key] || null;
};

/**
 * Save the sort for a subtab.
 *
 * @param {string}      key  The subtab key.
 * @param {Object|null} sort The sort type and order, or null to clear it.
 */
const saveSort = (key, sort) => {
  const saved = { ...getSetting('better-inventory.sort-state', {}) };
  if (sort) {
    saved[key] = sort;
  } else {
    delete saved[key];
  }

  saveSetting('better-inventory.sort-state', saved);
};

/**
 * Get the sort and filter definitions for a subtab.
 *
 * @param {string} subtab The subtab type.
 * @param {string} key    The subtab key.
 *
 * @return {Object} The sort options and filter groups.
 */
const getOptions = (subtab, key) => {
  const nameSort = { id: 'name', name: 'Name', text: 'Name', order: 'asc' };
  const quantitySort = { id: 'quantity', name: 'Quantity', text: 'Qty' };

  const sorts = componentSubtabs.has(subtab)
    ? [
        { id: 'power', name: 'Power', image: gameImage('ui/camp/trap/stat_power.png') },
        { id: 'power_bonus', name: 'Power Bonus', image: gameImage('ui/camp/trap/stat_power_bonus.png') },
        { id: 'luck', name: 'Luck', image: gameImage('ui/camp/trap/stat_luck.png') },
        { id: 'attraction_bonus', name: 'Attraction Bonus', image: gameImage('ui/camp/trap/stat_attraction_bonus.png') },
        { id: 'cheese_effect', name: 'Cheese Effect', image: gameImage('ui/camp/trap/stat_cheese_effect.png') },
        { id: 'min_title', name: 'Required rank', text: 'Rank' },
        nameSort,
        quantitySort,
      ]
    : [nameSort, quantitySort];

  const filters = [];

  if ('weapon' === subtab) {
    filters.push({
      id: 'power_type',
      label: 'Power',
      options: powerTypes.map((type) => ({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        image: gameImage(`powertypes/${type}.png`),
      })),
    });
  }

  // Bait is nearly all limited edition and its recommendations are just what the location uses.
  const isBait = key.startsWith('cheese-');
  const showOptions = isBait
    ? []
    : [
        { id: 'le', name: 'Limited Edition', text: 'LE' },
        { id: 'non-le', name: 'Not Limited Edition', text: 'Non-LE' },
      ];

  if ('favorites' !== subtab && getSetting('better-inventory.favorites', false)) {
    showOptions.unshift({ id: 'favorites', name: 'Favorites', text: '★' });
  }

  if (componentSubtabs.has(subtab)) {
    showOptions.push({ id: 'special', name: 'Has a special effect', text: 'Special' }, { id: 'normal', name: 'No special effect', text: 'Normal' });
  }

  const data = trapData.get(trapClassifications[subtab]);
  if (data?.recommended.size && 'skin' !== subtab && !isBait) {
    showOptions.push({ id: 'recommended', name: 'Recommended for your location', text: 'Recommended' });
  }

  if (showOptions.length) {
    filters.push({ id: 'limited', label: 'Show', options: showOptions });
  }

  if (areaSubtabs.has(subtab) && data?.areas.length) {
    filters.push({ id: 'area', label: 'Area', select: true, options: data.areas });
  }

  return { sorts, filters };
};

/**
 * Read the displayed quantity from an inventory item element.
 *
 * @param {Element} el The inventory item element.
 *
 * @return {number} The quantity.
 */
const getQuantity = (el) => {
  const qtyEl = el.querySelector('.quantity');
  if (!qtyEl) {
    return 0;
  }

  const text = (qtyEl.getAttribute('title') || qtyEl.textContent || '').trim().toLowerCase().replaceAll(',', '');
  const num = Number.parseFloat(text);
  if (Number.isNaN(num)) {
    return 0;
  }

  if (text.includes('m')) {
    return num * 1_000_000;
  }

  if (text.includes('k')) {
    return num * 1000;
  }

  return num;
};

/**
 * Get an item's untouched name (Enhanced Search appends its terms to `data-name`).
 *
 * @param {Element} el The inventory item element.
 *
 * @return {string} The name.
 */
const getName = (el) => el.getAttribute('data-mhui-name') || el.getAttribute('data-name') || '';

/**
 * Get the numeric value an item sorts on.
 *
 * @param {Element} el       The inventory item element.
 * @param {string}  sortType The sort type.
 *
 * @return {number} The value.
 */
const getSortValue = (el, sortType) => {
  if ('quantity' === sortType) {
    return getQuantity(el);
  }

  const stats = itemsByType.get(el.getAttribute('data-item-type'))?.has_stats;
  if (!stats) {
    return 0;
  }

  if ('min_title' === sortType) {
    return titleOrder.get(stats.min_title) || 0;
  }

  if ('cheese_effect' === sortType) {
    return cheeseEffectValues[stats.cheese_effect] || 0;
  }

  const value = Number.parseFloat(stats[sortType]);
  if (value && !Number.isNaN(value)) {
    return value;
  }

  return Number.parseFloat(String(stats[`${sortType}_formatted`] || '0').replace('%', '')) || 0;
};

/**
 * Sort item elements by a sort.
 *
 * @param {Element[]}   els  The inventory item elements.
 * @param {Object|null} sort The sort type and order, or null for alphabetical.
 *
 * @return {Element[]} The sorted elements.
 */
const sortItems = (els, sort) => {
  const type = sort?.type || 'name';
  const direction = 'asc' === (sort?.order || 'asc') ? 1 : -1;

  const keyed = els.map((el) => ({ el, name: getName(el), value: 'name' === type ? 0 : getSortValue(el, type) }));
  keyed.sort((a, b) => {
    const result = 'name' === type ? a.name.localeCompare(b.name) : a.value - b.value;
    // Ties fall back to alphabetical so equal items don't shuffle between sorts.
    return result * direction || a.name.localeCompare(b.name);
  });

  return keyed.map(({ el }) => el);
};

/**
 * Sort the items inside each listing of a subtab.
 *
 * @param {Element}     subtabEl The subtab content element.
 * @param {Object|null} sort     The sort type and order, or null for alphabetical.
 * @param {string}      selector The listings to sort.
 */
const sortListings = (subtabEl, sort, selector) => {
  subtabEl.querySelectorAll(selector).forEach((list) => {
    const els = [...list.children].filter((el) => el.classList.contains('inventoryPage-item'));
    if (els.length < 2) {
      return;
    }

    const sorted = sortItems(els, sort);

    // Only touch the DOM when the order actually changed.
    if (sorted.every((el, index) => el === els[index])) {
      return;
    }

    sorted.forEach((el) => list.append(el));
  });
};

/**
 * Check whether a subtab shows one flat list while sorted.
 *
 * The Favorites groups are item classifications with different card sizes rather than areas, so
 * they stay grouped.
 *
 * @param {Element} subtabEl The subtab content element.
 *
 * @return {boolean} Whether it flattens.
 */
const isFlattened = (subtabEl) => 'favorites' !== subtabEl.getAttribute('data-tab');

/**
 * Get the name of the area picked in the tag directory.
 *
 * @param {Element} subtabEl The subtab content element.
 *
 * @return {string} The name.
 */
const getActiveTagName = (subtabEl) => {
  const tag = subtabEl.querySelector('.inventoryPage-tagDirectory-tag.active');
  if (!tag || 'all' === tag.getAttribute('data-tag')) {
    return 'All';
  }

  return tag.textContent.replace(/\s*\([\d,]*\)\s*$/, '').trim() || 'All';
};

/**
 * Show a subtab's items as one sorted list, or put its area groups back.
 *
 * The items stay in their groups so the game, the tag directory, and lock & hide keep working on
 * them. The groups are flattened with CSS and the items placed with `order`.
 *
 * @param {Element}     subtabEl The subtab content element.
 * @param {Object|null} sort     The sort type and order, or null to show the groups.
 */
const flattenSubtab = (subtabEl, sort) => {
  const tagContent = subtabEl.querySelector('.inventoryPage-tagContent');
  const els = [
    ...subtabEl.querySelectorAll('.inventoryPage-tagContent-tagGroup:not(.search, .mh-inventory-favorites-group) .inventoryPage-tagContent-listing > .inventoryPage-item'),
  ];

  subtabEl.classList.toggle('mh-inventory-sort-flat', Boolean(sort));

  if (!sort) {
    // Search results are copies of the items, so they can carry the order too.
    subtabEl.querySelectorAll('.inventoryPage-item').forEach((el) => {
      el.style.removeProperty('order');
      el.classList.remove('mh-inventory-sort-duplicate');
    });
    tagContent?.querySelector('.mh-inventory-sort-flat-title')?.remove();
    return;
  }

  sortItems(els, sort).forEach((el, index) => {
    el.style.order = index + 1;
  });

  // Items can be in more than one area, so only show the first copy among the shown groups.
  const seen = new Set();
  els.forEach((el) => {
    const group = el.closest('.inventoryPage-tagContent-tagGroup');
    const type = el.getAttribute('data-item-type');
    const isShown = !group.classList.contains('contracted') && !group.classList.contains('hidden');
    el.classList.toggle('mh-inventory-sort-duplicate', isShown && seen.has(type));
    if (isShown) {
      seen.add(type);
    }
  });

  if (!tagContent) {
    return;
  }

  let title = tagContent.querySelector('.mh-inventory-sort-flat-title');
  if (!title) {
    title = make('div', ['inventoryPage-tagContent-tagTitle', 'mh-inventory-sort-flat-title']);
    tagContent.prepend(title);
  }

  const count = new Set(
    els
      .filter((el) => {
        const group = el.closest('.inventoryPage-tagContent-tagGroup');
        return !el.classList.contains('mh-inventory-item-filtered') && !group.classList.contains('contracted') && !group.classList.contains('hidden');
      })
      .map((el) => el.getAttribute('data-item-type'))
  ).size;

  title.textContent = `${getActiveTagName(subtabEl)} (`;
  make('span', 'inventoryPage-tagContent-itemCount', count.toLocaleString(), title);
  title.append(')');
};

/**
 * Apply a sort to a subtab.
 *
 * @param {Element}     subtabEl The subtab content element.
 * @param {Object|null} sort     The sort type and order, or null to clear it.
 */
const applySort = (subtabEl, sort) => {
  if (isFlattened(subtabEl)) {
    flattenSubtab(subtabEl, sort);
    // Search results are copies the game rebuilds on every search, so sort them in place.
    sortListings(subtabEl, sort, '.inventoryPage-tagContent-tagGroup.search > div');
    return;
  }

  sortListings(subtabEl, sort, '.inventoryPage-tagContent-listing, .inventoryPage-tagContent-tagGroup.search > div');
};

/**
 * Check whether an item passes a filter.
 *
 * @param {Element} el     The inventory item element.
 * @param {string}  filter The filter group id.
 * @param {string}  value  The selected option.
 *
 * @return {boolean} Whether the item should be shown.
 */
const passesFilter = (el, filter, value) => {
  const type = el.getAttribute('data-item-type');
  const item = itemsByType.get(type);

  if ('power_type' === filter) {
    return item?.has_stats?.power_type === value;
  }

  if ('area' === filter) {
    return Boolean(trapItems.get(type)?.areas.includes(value));
  }

  const checks = {
    // A saved Favorites filter shouldn't hide everything once favorites are turned off.
    favorites: () => !getSetting('better-inventory.favorites', false) || el.classList.contains('mh-inventory-favorited'),
    le: () => Boolean(item?.is_limited_edition),
    'non-le': () => !item?.is_limited_edition,
    special: () => specialTypes.has(type),
    normal: () => !specialTypes.has(type),
    recommended: () => Boolean(trapItems.get(type)?.recommended),
  };

  return checks[value] ? checks[value]() : true;
};

/**
 * Show and hide items in a subtab based on its filters.
 *
 * @param {Element} subtabEl The subtab content element.
 * @param {Object}  filters  The selected option for each filter group.
 *
 * @return {Object} The number of shown and total unique items.
 */
const filterSubtab = (subtabEl, filters) => {
  const active = Object.entries(filters).filter(([, value]) => value);
  const shownTypes = new Set();
  const allTypes = new Set();

  // The Favorites group holds copies, and is hidden while filtering.
  subtabEl.querySelectorAll('.inventoryPage-tagContent-tagGroup:not(.mh-inventory-favorites-group)').forEach((group) => {
    let visibleCount = 0;
    group.querySelectorAll('.inventoryPage-item').forEach((el) => {
      const visible = active.every(([filter, value]) => passesFilter(el, filter, value));
      el.classList.toggle('mh-inventory-item-filtered', !visible);

      const type = el.getAttribute('data-item-type');
      allTypes.add(type);
      if (visible) {
        shownTypes.add(type);
        visibleCount++;
      }
    });

    group.classList.toggle('mh-inventory-group-filtered', active.length > 0 && 0 === visibleCount);
  });

  return { shown: shownTypes.size, total: allTypes.size };
};

/**
 * Load the trap selector's area tags and recommendations for a classification.
 *
 * @param {string} classification The trap component classification.
 */
const loadTrapData = async (classification) => {
  if (!classification || trapData.has(classification)) {
    return;
  }

  // Only ask once, even if it fails.
  trapData.set(classification, { recommended: new Set(), areas: [] });

  const response = await doRequest('managers/ajax/users/gettrapcomponents.php', { classification });
  if (!response?.components) {
    return;
  }

  const recommended = new Set(Object.values(response.recommended || {}).flat());
  const tagNames = new Map(Object.values(response.tags || {}).map((tag) => [tag.type, tag.name]));
  const counts = new Map();

  response.components.forEach((item) => {
    let areas = (item.tag_types || []).filter((tag) => !hiddenTags.has(tag) && !('weapon' === classification && powerTypes.includes(tag)));
    if (!areas.length) {
      areas = ['default'];
    }

    trapItems.set(item.type, { areas, recommended: recommended.has(item.type) });

    if (item.quantity > 0) {
      areas.forEach((area) => counts.set(area, (counts.get(area) || 0) + 1));
    }
  });

  const areas = [...counts.entries()]
    .map(([id, count]) => ({ id, name: 'default' === id ? 'Misc.' : tagNames.get(id) || id, count }))
    // Misc. goes last, like a catch-all.
    .sort((a, b) => ('default' === a.id) - ('default' === b.id) || a.name.localeCompare(b.name));

  trapData.set(classification, { recommended, areas });
};

/**
 * Make a tile that looks like the trap selector's quick links.
 *
 * @param {Object}  option   The option definition.
 * @param {string}  title    The tooltip.
 * @param {Element} appendTo The row to add it to.
 *
 * @return {HTMLElement} The tile.
 */
const makeTile = (option, title, appendTo) => {
  const tile = make('a', ['mh-inventory-sort-tile', option.text ? 'mh-inventory-sort-tile--text' : ''], '', appendTo);
  tile.href = '#';
  tile.title = title;
  tile.setAttribute('aria-label', title);
  tile.dataset.option = option.id;

  if (option.image) {
    tile.style.backgroundImage = `url(${option.image})`;
  }

  if (option.text) {
    make('span', 'mh-inventory-sort-tile-text', option.text, tile);
  }

  return tile;
};

/**
 * Add a labelled group of tiles to a row.
 *
 * @param {Element} row   The row.
 * @param {string}  id    The group id.
 * @param {string}  label The label.
 *
 * @return {HTMLElement} The tiles container.
 */
const makeGroup = (row, id, label) => {
  const group = make('div', ['mh-inventory-sort-group', `mh-inventory-sort-group--${id}`], '', row);
  make('div', 'mh-inventory-sort-label', label, group);
  return make('div', 'mh-inventory-sort-tiles', '', group);
};

/**
 * Build the sort and filter panel for a subtab.
 *
 * @param {Element} subtabEl The subtab content element.
 * @param {string}  key      The subtab key used to remember its sort.
 * @param {string}  subtab   The subtab type.
 */
const addControls = (subtabEl, key, subtab) => {
  const tagContent = subtabEl.querySelector('.inventoryPage-tagContent');
  if (!tagContent) {
    return;
  }

  const { sorts, filters: filterGroups } = getOptions(subtab, key);

  if (!filterState.has(key)) {
    filterState.set(key, {});
  }

  const filters = filterState.get(key);
  let sort = getSavedSort(key);

  const panel = make('div', 'mh-inventory-sort');
  panel.dataset.key = key;

  // Share rows where they fit: the trap stat sorts fill a row by themselves, the weapon power
  // tiles pair with Show, and the Area dropdown goes wherever there's room left.
  const isComponent = componentSubtabs.has(subtab);
  const hasPower = filterGroups.some((group) => 'power_type' === group.id);
  const sortRow = make('div', 'mh-inventory-sort-row', '', panel);
  const filterRow = isComponent ? make('div', 'mh-inventory-sort-row', '', panel) : sortRow;

  const sortTiles = makeGroup(sortRow, 'sort', 'Sort');

  const filterRows = filterGroups.map((group) => ({
    group,
    tiles: makeGroup(group.select && hasPower ? sortRow : filterRow, group.id, group.label),
  }));

  // Other modules (lock & hide) put their toggles here instead of above the panel.
  make('div', 'mh-inventory-sort-actions', '', sortRow);

  const footer = make('div', 'mh-inventory-sort-footer', '', panel);
  const countEl = make('span', 'mh-inventory-sort-count', '', footer);

  const render = () => {
    sortTiles.querySelectorAll('.mh-inventory-sort-tile').forEach((tile) => {
      const option = sorts.find((s) => s.id === tile.dataset.option);
      const isActive = sort?.type === option.id;

      tile.classList.toggle('active', isActive);
      if (isActive) {
        const isDefault = sort.order === (option.order || 'desc');
        tile.dataset.order = sort.order;
        tile.title = `Sorted by ${option.name}, ${'desc' === sort.order ? 'highest' : 'lowest'} first. Click to ${isDefault ? 'reverse' : 'clear'}.`;
      } else {
        delete tile.dataset.order;
        tile.title = `Sort by ${option.name}`;
      }
    });

    filterRows.forEach(({ group, tiles }) => {
      tiles.querySelectorAll('.mh-inventory-sort-tile').forEach((tile) => {
        tile.classList.toggle('active', filters[group.id] === tile.dataset.option);
      });

      const select = tiles.querySelector('.mh-inventory-sort-select');
      if (select) {
        select.value = filters[group.id] || '';
      }
    });

    const { shown, total } = filterSubtab(subtabEl, filters);
    const isFiltered = Object.values(filters).some(Boolean);
    countEl.textContent = isFiltered ? `Showing ${shown} of ${total}` : '';
    panel.classList.toggle('mh-inventory-sort--active', isFiltered || Boolean(sort));
    subtabEl.classList.toggle('mh-inventory-sort-filtering', isFiltered);

    // Applied after filtering so the flat list's count leaves out filtered items.
    if (sort) {
      applySort(subtabEl, sort);
    }

    // Favorites go back to their usual places while sorting or filtering.
    doEvent('mh-improved-inventory-sort-rendered', subtabEl);
  };

  /**
   * Change the sort, clearing it with null.
   *
   * @param {Object|null} newSort The sort type and order.
   */
  const setSort = (newSort) => {
    sort = newSort;
    saveSort(key, sort);
    if (!sort) {
      applySort(subtabEl, null);
    }

    render();
  };

  sorts.forEach((option) => {
    const tile = makeTile(option, `Sort by ${option.name}`, sortTiles);
    tile.addEventListener('click', (event) => {
      event.preventDefault();

      // Default direction, then reversed, then off.
      const defaultOrder = option.order || 'desc';
      if (sort?.type !== option.id) {
        setSort({ type: option.id, order: defaultOrder });
      } else if (sort.order === defaultOrder) {
        setSort({ type: option.id, order: 'asc' === defaultOrder ? 'desc' : 'asc' });
      } else {
        setSort(null);
      }
    });
  });

  filterRows.forEach(({ group, tiles }) => {
    if (group.select) {
      const select = make('select', 'mh-inventory-sort-select', '', tiles);
      select.setAttribute('aria-label', group.label);
      make('option', '', 'All', select).value = '';
      group.options.forEach((option) => {
        make('option', '', `${option.name} (${option.count})`, select).value = option.id;
      });

      select.addEventListener('change', () => {
        filters[group.id] = select.value || null;
        render();
      });

      return;
    }

    group.options.forEach((option) => {
      const tile = makeTile(option, `Show ${option.name}`, tiles);
      tile.addEventListener('click', (event) => {
        event.preventDefault();

        filters[group.id] = filters[group.id] === option.id ? null : option.id;
        render();
      });
    });
  });

  panel.mhRender = render;

  tagContent.prepend(panel);
  render();

  doEvent('mh-improved-inventory-sort-panel-added', panel);
};

/**
 * Add the controls to the visible subtab and re-apply its sort and filters.
 */
const decorateActiveSubtab = async () => {
  if ('inventory' !== getCurrentPage()) {
    return;
  }

  const tabEl = document.querySelector('.mousehuntHud-page-tabContent.active');
  const subtabEl = tabEl?.querySelector('.mousehuntHud-page-subTabContent.active');
  if (!subtabEl || !subtabEl.querySelector('.inventoryPage-item')) {
    return;
  }

  const tab = tabEl.getAttribute('data-tab');
  const subtab = subtabEl.getAttribute('data-tab');
  if ('plankrun' === tab || skippedSubtabs.has(subtab)) {
    return;
  }

  const key = `${tab}-${subtab}`;

  // Picking an area or searching changes which groups show, so the flat list needs redoing.
  if (!subtabEl.mhSortListening) {
    subtabEl.mhSortListening = true;
    subtabEl.addEventListener('click', (event) => {
      if (event.target.closest('.inventoryPage-tagDirectory-tag, .inventoryPage-tagDirectory-searchBar-clear')) {
        reapplySorting(350);
      }
    });
    subtabEl.addEventListener('keyup', (event) => {
      if (event.target.classList.contains('inventoryPage-tagDirectory-searchBar-input')) {
        // The game waits 300ms before searching.
        reapplySorting(350);
      }
    });
  }

  // The game re-renders a subtab when it loads, which drops the old panel. Rendering also puts
  // back the sort, which the game undoes when it re-sorts groups after an item is used.
  const panel = subtabEl.querySelector('.mh-inventory-sort');
  if (panel) {
    panel.mhRender();
    return;
  }

  // The area and recommended filters need the trap selector's data, which is loaded once.
  if (subtabEl.mhSortLoading) {
    return;
  }

  subtabEl.mhSortLoading = true;
  await loadTrapData(trapClassifications[subtab]);
  subtabEl.mhSortLoading = false;

  if (!subtabEl.isConnected || subtabEl.querySelector('.mh-inventory-sort')) {
    return;
  }

  addControls(subtabEl, key, subtab);
};

let pending;

/**
 * Re-apply the sorting once the game has finished updating the page.
 *
 * @param {number} delay How long to wait.
 */
const reapplySorting = (delay = 50) => {
  clearTimeout(pending);
  pending = setTimeout(decorateActiveSubtab, delay);
};

/**
 * Initialize the sorting controls.
 */
const init = async () => {
  addStyles(styles, 'better-inventory-sorting');

  const [items, titles, effects] = await Promise.all([getData('items'), getData('titles'), getData('trap-special-effects')]);

  itemsByType = new Map((items || []).map((item) => [item.type, item]));
  titleOrder = new Map((titles || []).map((title) => [title.id, title.order]));
  // Unlike the location-scoped trap selector filter, this counts an item as special if it has
  // an effect anywhere in the game.
  specialTypes = new Set(Object.values(effects || {}).flat());

  onNavigation(() => reapplySorting(300), {
    page: 'inventory',
    anyTab: true,
    anySubtab: true,
  });

  // Subtabs load lazily, and using an item makes the game re-sort the groups it touched.
  onRequest('*', () => {
    if ('inventory' === getCurrentPage()) {
      reapplySorting();
    }
  });
};

export { reapplySorting };
export default init;
