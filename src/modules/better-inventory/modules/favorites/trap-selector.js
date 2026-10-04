import { addModuleStyles, getSetting, make, onEvent, onRequest, saveSetting } from '@utils';

const classifications = new Set(['weapon', 'base', 'trinket', 'bait', 'skin']);

// Trap components by type and by id, from the trap selector's own requests.
const components = new Map();
const componentsById = new Map();

let observed = null;
let observer = null;

/**
 * Get the item type the trap selector is browsing.
 *
 * @return {string|null} The classification.
 */
const getBrowsingClassification = () => {
  const container = document.querySelector('.trapSelectorView__itemBrowserContainer');
  return [...(container?.classList || [])].find((className) => classifications.has(className)) || null;
};

/**
 * Get the inventory favorites.
 *
 * @return {string[]} The item types.
 */
const getFavorites = () => getSetting('better-inventory.favorite-items', []);

/**
 * Fill the trap selector's list stars for inventory favorites.
 */
const updateListStars = () => {
  const selectors = getFavorites().map((type) => `.campPage-trap-itemBrowser-item.${CSS.escape(type)} .campPage-trap-itemBrowser-item-favorite.no`);

  addModuleStyles(
    selectors.length ? `${selectors.join(',')} { background-image: url(https://www.mousehuntgame.com/images/ui/camp/trap/star_favorite.png); }` : '',
    'mh-improved-styles-better-inventory-trap-favorite-stars',
    true
  );
};

/**
 * Check whether the game's own favorites are all used.
 *
 * @return {boolean} Whether all five are filled.
 */
const areGameFavoritesFull = () => {
  const row = document.querySelector('.campPage-trap-itemBrowser-favorites');
  return (row?.querySelectorAll('.campPage-trap-itemBrowser-favorite-item:not(.mh-inventory-trap-favorite, .empty)[data-item-id]').length || 0) >= 5;
};

/**
 * Use the list stars for inventory favorites once the game's five are used up, rather than
 * letting the game swap one of them out.
 *
 * Runs in the capture phase so it gets the click before the game's own handler on the star.
 *
 * @param {Event} event The click event.
 */
const onListStarClick = (event) => {
  const star = event.target.closest?.('.campPage-trap-itemBrowser-item .campPage-trap-itemBrowser-item-favorite.no');
  if (!star) {
    return;
  }

  const item = componentsById.get(String(star.getAttribute('data-item-id')));
  if (!item) {
    return;
  }

  const favorites = getFavorites();
  const isFavorite = favorites.includes(item.type);
  if (!isFavorite && !areGameFavoritesFull()) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();

  saveSetting('better-inventory.favorite-items', isFavorite ? favorites.filter((type) => type !== item.type) : [...favorites, item.type]);
  updateListStars();
  addFavoriteTiles();
};

/**
 * Arm or disarm an item from its tile.
 *
 * @param {Object}  item The trap component.
 * @param {Element} tile The tile.
 */
const toggleArmed = (item, tile) => {
  if (tile.classList.contains('busy')) {
    return;
  }

  tile.classList.add('busy');
  const done = () => tile.classList.remove('busy');

  if (hg.utils.UserInventory.isArmed(item.item_id)) {
    hg.utils.TrapControl.disarmItem(item.classification).go(done, done);
  } else {
    hg.utils.TrapControl.armItem(item.type, item.classification).go(done, done);
  }
};

/**
 * Make a tile matching the game's favorite items.
 *
 * @param {Object}  item     The trap component.
 * @param {Element} appendTo The favorites row.
 */
const makeTile = (item, appendTo) => {
  const tile = make('div', ['campPage-trap-itemBrowser-favorite-item', 'mh-inventory-trap-favorite'], '', appendTo);
  tile.setAttribute('data-item-id', item.item_id);

  const image = make('a', 'campPage-trap-itemBrowser-favorite-item-image', '', tile);
  image.href = '#';
  image.title = `Click to arm ${item.name} (inventory favorite)`;
  image.setAttribute('data-item-id', item.item_id);
  image.setAttribute('data-item-classification', item.classification);
  image.style.backgroundImage = `url(${item.thumbnail})`;

  make('div', 'campPage-trap-itemBrowser-favorite-item-image-frame', '', image);

  if ('bait' === item.classification || 'trinket' === item.classification) {
    make('div', 'campPage-trap-itemBrowser-favorite-item-image-quantity', Number(item.quantity).toLocaleString(), image);
  }

  image.addEventListener('click', (event) => {
    event.preventDefault();
    toggleArmed(item, image);
  });

  // The game's own star, so it looks and hovers the same as on its favorites.
  const star = make('a', 'campPage-trap-itemBrowser-favorite-item-toggleFavorite', '', tile);
  star.href = '#';
  star.title = 'Remove from inventory favorites';
  star.addEventListener('click', (event) => {
    event.preventDefault();
    saveSetting(
      'better-inventory.favorite-items',
      getFavorites().filter((type) => type !== item.type)
    );
    updateListStars();
    addFavoriteTiles();
  });
};

/**
 * Add the inventory favorites to the trap selector's favorites row.
 */
const addFavoriteTiles = () => {
  const row = document.querySelector('.campPage-trap-itemBrowser-favorites');
  if (!row) {
    return;
  }

  watchRow(row);

  // Wait for the game to fill its own favorites so we know which ones to skip.
  if (row.querySelector('.campPage-trap-itemBrowser-favorite-item.loading')) {
    return;
  }

  const classification = getBrowsingClassification();
  const gameFavorites = new Set(
    [...row.querySelectorAll('.campPage-trap-itemBrowser-favorite-item:not(.mh-inventory-trap-favorite)[data-item-id]')].map((el) => el.getAttribute('data-item-id'))
  );

  const items = getFavorites()
    .map((type) => components.get(type))
    .filter((item) => item && item.classification === classification && item.quantity > 0 && !gameFavorites.has(String(item.item_id)));

  const existing = [...row.querySelectorAll('.mh-inventory-trap-favorite')];
  const key = items.map((item) => `${item.item_id}:${item.quantity}`).join(',');
  if (row.dataset.mhInventoryFavorites === key && existing.length === items.length) {
    return;
  }

  existing.forEach((el) => el.remove());
  items.forEach((item) => makeTile(item, row));
  row.dataset.mhInventoryFavorites = key;
};

/**
 * Put the tiles back whenever the game re-renders its favorites.
 *
 * @param {Element} row The favorites row.
 */
const watchRow = (row) => {
  if (observed === row) {
    return;
  }

  observer?.disconnect();
  observed = row;
  observer = new MutationObserver(() => {
    if (!row.querySelector('.mh-inventory-trap-favorite')) {
      delete row.dataset.mhInventoryFavorites;
    }

    addFavoriteTiles();
  });
  observer.observe(row, { childList: true });
};

/**
 * Show inventory favorites in the trap selector.
 */
const init = () => {
  updateListStars();
  document.addEventListener('click', onListStarClick, true);

  onRequest('users/gettrapcomponents.php', (data) => {
    (data?.components || []).forEach((item) => {
      components.set(item.type, item);
      componentsById.set(String(item.item_id), item);
    });
    setTimeout(addFavoriteTiles, 0);
  });

  onRequest('users/changetrap.php', (data) => {
    // Arming uses up bait and charms, so keep the quantities on the tiles current.
    (data?.inventory ? Object.values(data.inventory) : []).forEach((item) => {
      const component = components.get(item.type);
      if (component && undefined !== item.quantity) {
        component.quantity = item.quantity;
      }
    });

    setTimeout(addFavoriteTiles, 0);
  });

  // Favorites can change on the inventory page without a page load.
  onEvent('camp_page_toggle_blueprint', () => {
    updateListStars();
    setTimeout(addFavoriteTiles, 0);
  });
};

export default init;
