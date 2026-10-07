import { cacheGetNoExpiration, cacheSetNoExpiration, doEvent, getData, getSetting, saveSetting } from '@utils';

const pinsKey = 'quick-items-menu.pins';

// The kinds of inventory items that can be pinned. Recipes aren't items, so they're kept separately.
const classifications = ['convertible', 'message_item', 'weapon', 'base', 'bait', 'trinket', 'potion'];

/**
 * Options for a pin's tab, alongside the icon and name choices every item has.
 */
const pinOptions = [{ key: 'quantity', label: 'Show quantity', default: false }];

/**
 * Get the pins, each with an `id` and the item types it has. One with more than one item is a group.
 *
 * @return {Array} The pins.
 */
const getPins = () => {
  const pins = getSetting(pinsKey, []);
  if (!Array.isArray(pins)) {
    return [];
  }

  return pins.filter((pin) => pin?.id).map((pin) => ({ id: pin.id, items: Array.isArray(pin.items) ? pin.items : [] }));
};

/**
 * Save the pins and let the menu know.
 *
 * It has its own event, since the settings page would otherwise ask for a refresh that isn't needed.
 *
 * @param {Array} pins The pins.
 */
const savePins = (pins) => {
  saveSetting(pinsKey, pins);
  doEvent('mh-improved-pins-changed', pins);
};

/**
 * Make an id for a new pin.
 *
 * @return {string} The id.
 */
const makePinId = () => `pinned-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Decode the HTML entities the inventory uses in item names (e.g. "&lt3 Gift Basket").
 *
 * @param {string} name The item name.
 *
 * @return {string} The decoded name.
 */
const decodeName = (name) => new DOMParser().parseFromString(name, 'text/html').documentElement.textContent;

/**
 * Get the pinnable items the user owns.
 *
 * @return {Promise<Array|null>} The owned items, or null if the inventory couldn't be loaded.
 */
const getOwnedItems = () => {
  return new Promise((resolve) => {
    try {
      hg.utils.UserInventory.getItemsByClass(classifications, true, resolve, () => resolve(null));
    } catch {
      resolve(null);
    }
  });
};

let pinnableItems = null;
let recipes = null;
let recipesRequest = null;

/**
 * Get the storage key for the user's recipes.
 *
 * @return {string} The cache key.
 */
const getRecipesKey = () => `quick-items-menu-recipes-${user?.user_id}`;

/**
 * Read the recipes the user knows from a Recipe Book page.
 *
 * @param {Document|HTMLElement} container The page.
 *
 * @return {Array} The recipes.
 */
const parseRecipes = (container) =>
  [...container.querySelectorAll('.inventoryPage-item.recipe.known')]
    .map((el) => ({
      type: el.dataset.itemType,
      name: el.dataset.name,
      thumbnail: el.querySelector('.itemImage img')?.getAttribute('src') || '',
      producedItem: el.dataset.producedItem,
      producedQuantity: Number.parseInt(el.dataset.producedQuantity, 10) || 1,
      parts: Object.fromEntries(
        [...el.querySelectorAll('.inventoryPage-item-content-description-consumedItem')].map((part) => [part.dataset.itemType, Number.parseInt(part.dataset.itemRequired, 10) || 1])
      ),
    }))
    .filter((recipe) => recipe.type && recipe.producedItem);

/**
 * Save the user's recipes, and make the picker use them.
 *
 * @param {Array} list The recipes.
 *
 * @return {Promise<Map>} The recipes, keyed by recipe type.
 */
const saveRecipes = async (list) => {
  await cacheSetNoExpiration(getRecipesKey(), list);
  recipes = Promise.resolve(new Map(list.map((recipe) => [recipe.type, recipe])));
  pinnableItems = null;

  return recipes;
};

/**
 * Get the recipes the user knows by loading their Recipe Book.
 *
 * Each player has unlocked different recipes, so they're read from their own Recipe Book page.
 *
 * @return {Promise<Map>} The recipes, keyed by recipe type.
 */
const fetchRecipes = async () => {
  const url = new URL('/inventory.php', window.location.origin);
  url.searchParams.set('tab', 'crafting');
  url.searchParams.set('sub_tab', 'recipe');

  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Couldn't load the Recipe Book (${response.status}).`);
  }

  const fetched = parseRecipes(new DOMParser().parseFromString(await response.text(), 'text/html'));

  // Don't save an empty list if the page didn't load as expected.
  if (!fetched.length) {
    throw new Error("Couldn't find any recipes in the Recipe Book.");
  }

  return saveRecipes(fetched);
};

/**
 * Get the saved recipes.
 *
 * @return {Promise<Map|null>} The recipes, keyed by recipe type, or null if they've never been loaded.
 */
const getSavedRecipes = () => {
  recipes ||= cacheGetNoExpiration(getRecipesKey(), null).then((saved) => (Array.isArray(saved) ? new Map(saved.map((recipe) => [recipe.type, recipe])) : null));

  return recipes;
};

/**
 * Get the user's recipes, as they were last saved.
 *
 * @return {Promise<Map>} The recipes, keyed by recipe type.
 */
const getRecipes = async () => (await getSavedRecipes()) || new Map();

/**
 * Load the user's recipes from their Recipe Book, if they've never been loaded.
 *
 * This only happens once: after that, they're kept up to date whenever the user visits the Recipe Book.
 */
const loadRecipes = async () => {
  if (await getSavedRecipes()) {
    return;
  }

  recipesRequest ||= fetchRecipes().catch(() => {
    // Try again the next time the menu editor is opened.
    recipesRequest = null;
  });

  await recipesRequest;
};

/**
 * Save the recipes shown on the Recipe Book page the user is on.
 */
const updateRecipesFromPage = () => {
  const found = parseRecipes(document);
  if (found.length) {
    saveRecipes(found);
  }
};

/**
 * Get the items that can be pinned: the items the user owns and the recipes they've fetched, plus
 * any that are already pinned, sorted by name.
 *
 * @return {Promise<Array>} The items, each with a `type`, `name`, `thumbnail`, and `classification`.
 */
const getPinnableItems = () => {
  pinnableItems ||= Promise.all([getOwnedItems(), getData('items'), loadRecipes().then(getRecipes)]).then(([owned, allItems, knownRecipes]) => {
    const all = (Array.isArray(allItems) ? allItems : [])
      .filter((item) => classifications.includes(item.classification))
      .map((item) => ({ type: item.type, name: item.name, thumbnail: item.images?.thumbnail, classification: item.classification }));

    const recipeItems = [...knownRecipes.values()].map((recipe) => ({ type: recipe.type, name: recipe.name, thumbnail: recipe.thumbnail, classification: 'recipe' }));

    // Fall back to every item if the inventory request fails.
    if (!Array.isArray(owned)) {
      return [...all, ...recipeItems].sort((a, b) => a.name.localeCompare(b.name));
    }

    const items = owned
      .filter((item) => Number(item.quantity) > 0)
      .map((item) => ({ type: item.type, name: decodeName(item.name), thumbnail: item.thumbnail, classification: item.classification }));
    items.push(...recipeItems);

    // Keep pinned items pickable after they're used up.
    for (const type of new Set(getPins().flatMap((pin) => pin.items))) {
      const item = items.some((i) => i.type === type) ? null : all.find((i) => i.type === type);
      if (item) {
        items.push(item);
      }
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Try again next time if it failed.
  pinnableItems.catch(() => {
    pinnableItems = null;
  });

  return pinnableItems;
};

export { getPinnableItems, getPins, getRecipes, loadRecipes, makePinId, pinOptions, savePins, updateRecipesFromPage };
