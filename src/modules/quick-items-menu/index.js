import {
  addHeaderMenuTab,
  addStyles,
  cacheGet,
  cacheSet,
  doEvent,
  getData,
  getUserItems,
  make,
  makeElement,
  makeMhButton,
  onNavigation,
  onEvent,
  onRequest,
  parseMouseHuntDate,
  sessionGet,
  sessionSet,
} from '@utils';

import { getPins, getRecipes, updateRecipesFromPage } from './pins';

import styles from './styles.css';

const moduleId = 'quick-items-menu';

/**
 * Trap auras granted by convertibles, keyed by the convertible's item type.
 */
const auras = {
  kilohertz_processor_convertible: { type: 'QuestMillenniaura', name: 'Millenniaura' },
  cursed_skull_convertible: { type: 'QuestSpookyAura', name: 'Spooky Aura' },
  dragon_skull_convertible: { type: 'QuestDragonsMightAura', name: "Dragon's Might Aura" },
  lightning_slayer_chest_convertible: { type: 'QuestLightningAura', name: 'Lightning Aura' },
  rare_lightning_slayer_chest_convertible: { type: 'QuestLightningAura', name: 'Lightning Aura' },
};

// The menu tabs, keyed by pin id.
const tabs = new Map();
let userItemsCache = null;
let userItemsRequest = null;

// How long the pinned items' inventory data is reused before it's fetched again. Quantities are kept
// in step from game responses in between, and opening an item always refetches.
const userItemsCacheTtl = 24 * 60 * 60 * 1000;

/**
 * Get the storage key for the pinned items' inventory data.
 *
 * @return {string} The cache key.
 */
const getUserItemsStorageKey = () => `${moduleId}-user-items-${user?.user_id}`;

/**
 * Save the pinned items' inventory data so it's reused across page loads.
 */
const saveUserItemsCache = () => {
  if (!userItemsCache) {
    return;
  }

  const { key, items, fetchedAt } = userItemsCache;
  const remaining = userItemsCacheTtl - (Date.now() - fetchedAt);
  if (remaining > 0) {
    cacheSet(getUserItemsStorageKey(), { key, fetchedAt, items: [...items.values()] }, remaining);
  }
};

/**
 * Load the saved inventory data for the pinned items, if it's still fresh.
 *
 * @param {string} key The pinned item types, joined.
 *
 * @return {Promise<Object|null>} The cache, or null when there isn't a fresh one.
 */
const loadUserItemsCache = async (key) => {
  const saved = await cacheGet(getUserItemsStorageKey(), null);
  if (saved?.key !== key || !Array.isArray(saved.items) || Date.now() - saved.fetchedAt >= userItemsCacheTtl) {
    return null;
  }

  return { key, items: new Map(saved.items.map((userItem) => [userItem.type, userItem])), fetchedAt: saved.fetchedAt };
};

/**
 * Get every item type that's pinned, without duplicates.
 *
 * @return {Promise<string[]>} The item types.
 */
const getPinnedItemTypes = async () => {
  const [allItems, recipes] = await Promise.all([getData('items'), getRecipes()]);
  const itemTypes = new Set((Array.isArray(allItems) ? allItems : []).map((item) => item.type));

  // Recipes aren't items, and asking the game for one never answers, so only ask for real items.
  return [...new Set(getPins().flatMap((pin) => pin.items))].filter((type) => !recipes.has(type) && (!itemTypes.size || itemTypes.has(type)));
};

/**
 * Get the user's inventory data for every pinned item in one request, cached and shared between the pins.
 *
 * @param {boolean} forceUpdate Whether to skip the cache.
 *
 * @return {Promise<Map>} The inventory data, keyed by item type.
 */
const getPinnedUserItems = async (forceUpdate = false) => {
  const types = await getPinnedItemTypes();
  const key = types.join(',');
  if (!types.length) {
    return new Map();
  }

  const isCacheFresh = userItemsCache?.key === key && Date.now() - userItemsCache.fetchedAt < userItemsCacheTtl;
  if (!forceUpdate && isCacheFresh) {
    return userItemsCache.items;
  }

  if (!forceUpdate && !userItemsCache) {
    const saved = await loadUserItemsCache(key);
    if (saved) {
      userItemsCache = saved;
      return saved.items;
    }
  }

  // Share a request that's already running, unless it might be older than what was asked for.
  if (userItemsRequest?.key === key && (!forceUpdate || userItemsRequest.forceUpdate)) {
    return userItemsRequest.promise;
  }

  // Once there's been a request, a stale cache means the game's inventory cache is stale too.
  const request = {
    key,
    forceUpdate,
    promise: getUserItems(types, forceUpdate || Boolean(userItemsCache)).then((userItems) => {
      const items = new Map(userItems.map((userItem) => [userItem.type, userItem]));
      userItemsCache = { key, items, fetchedAt: Date.now() };
      saveUserItemsCache();
      return items;
    }),
  };

  userItemsRequest = request;
  request.promise
    .finally(() => {
      if (userItemsRequest === request) {
        userItemsRequest = null;
      }
    })
    .catch(() => {});

  return request.promise;
};

/**
 * Get the time remaining until an expiry in a compact format, like "1h 12m".
 *
 * @param {number} expiry The expiry timestamp.
 *
 * @return {string} The time remaining.
 */
const getRemainingShort = (expiry) => {
  const minutes = Math.max(0, Math.floor((expiry - Date.now()) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

/**
 * Show the result of opening a convertible.
 *
 * @param {HTMLElement} result   The element to show it in.
 * @param {Object}      item     The convertible.
 * @param {number}      quantity The number opened.
 * @param {Object}      data     The response from the server.
 */
const showResult = (result, item, quantity, data) => {
  result.innerHTML = '';
  result.classList.remove('error');

  const verb = item.actionVerb || 'Open';
  const pastVerb = verb.endsWith('e') ? `${verb}d` : `${verb}ed`;
  makeElement('div', 'mh-quick-items-menu-result-title', `${pastVerb} ${quantity.toLocaleString()} ${item.name}.`, result);

  const items = data?.convertible_open?.items || [];
  if (!items.length) {
    return;
  }

  const list = makeElement('ul', 'mh-quick-items-menu-result-items');
  items.forEach((resultItem) => {
    const row = makeElement('li', '');
    makeElement('span', 'quantity', `${Number(resultItem.quantity || 0).toLocaleString()}×`, row);
    makeElement('span', 'name', resultItem.name, row);
    list.append(row);
  });

  result.append(list);
};

/**
 * Show an error message in the dropdown.
 *
 * @param {HTMLElement} result  The element to show it in.
 * @param {string}      message The message.
 */
const showError = (result, message) => {
  result.innerHTML = '';
  result.classList.add('error');
  result.textContent = message;
};

/**
 * What each kind of pinned item does, keyed by its classification.
 *
 * - convertible: opened by quantity.
 * - message: used, like Scrambles.
 * - trap: a weapon or base, armed.
 * - loadout: bait or a charm, armed or disarmed.
 * - potion: brewed from its item view.
 * - recipe: crafted from the game's craft popup.
 */
const kinds = {
  convertible: 'convertible',
  message_item: 'message',
  weapon: 'trap',
  base: 'trap',
  bait: 'loadout',
  trinket: 'loadout',
  potion: 'potion',
  recipe: 'recipe',
};

// The kinds that show how many the user has.
const countedKinds = new Set(['convertible', 'loadout', 'potion']);

/**
 * Get a weapon's power type, like "Forgotten".
 *
 * @param {Object} stats The item's stats.
 *
 * @return {string} The power type, or an empty string for bases, which don't have one.
 */
const getPowerType = (stats) => (stats?.power_type ? `${stats.power_type.charAt(0).toUpperCase()}${stats.power_type.slice(1)}` : '');

/**
 * Create one of a tab's items, shown as a row in its dropdown.
 *
 * @param {string} itemType The item type.
 * @param {Object} tab      The tab it's in.
 *
 * @return {Object} The item's controls.
 */
const createEntry = (itemType, tab) => {
  let item = null;
  let aura = null;
  let auraExpiry = null;
  let isOpening = false;
  const elements = {};

  const pin = { row: null };

  /**
   * Get the session key for the cached aura expiry.
   *
   * @return {string} The session key.
   */
  const getAuraCacheKey = () => `${moduleId}-aura-expiry-${aura?.type}`;

  /**
   * Check if the convertible's aura is active.
   *
   * @return {boolean} Whether the aura is active.
   */
  const isAuraActive = () => Boolean(aura && auraExpiry && auraExpiry > Date.now());

  /**
   * Match the button label to the quantity, like "Open 5".
   */
  const updateButtonLabel = () => {
    const label = elements.button.querySelector('span');

    switch (item?.kind) {
      case 'convertible': {
        const quantity = Number.parseInt(elements.quantity.value, 10);
        label.textContent = `${item.actionVerb || 'Open'}${quantity > 0 ? ` ${quantity.toLocaleString()}` : ''}`;
        break;
      }
      case 'trap':
        label.textContent = isArmed() ? 'Armed' : 'Arm';
        break;
      case 'loadout':
        label.textContent = isArmed() ? 'Disarm' : 'Arm';
        break;
      case 'potion':
        label.textContent = 'Brew';
        break;
      case 'recipe':
        label.textContent = 'Craft';
        break;
      default:
        label.textContent = item?.actionVerb || 'Use';
    }
  };

  /**
   * Check if the weapon, base, bait, or charm is armed.
   *
   * @return {boolean} Whether it's armed.
   */
  const isArmed = () => Boolean(item?.itemId && hg.utils.UserInventory.isArmed(item.itemId));

  /**
   * Check if the row's button can be used right now.
   *
   * @return {boolean} Whether it can.
   */
  const canUse = () => {
    if (isOpening) {
      return false;
    }

    switch (item.kind) {
      case 'trap':
        return !isArmed();
      case 'loadout':
        return isArmed() || item.quantity > 0;
      case 'message':
      case 'recipe':
        return true;
      default:
        return item.quantity > 0;
    }
  };

  /**
   * Update the row to match the current state.
   */
  const render = () => {
    if (pin.row && item) {
      const quantity = item.quantity || 0;

      // Message items and recipes aren't used up, so they only get a button on the same line as the name.
      pin.row.classList.toggle('mh-quick-items-menu-message-item', 'message' === item.kind || 'recipe' === item.kind);
      pin.row.dataset.kind = item.kind;
      pin.row.classList.toggle('mh-quick-items-menu-armed', isArmed());

      elements.name.textContent = item.name;
      elements.name.title = item.name;
      elements.image.style.backgroundImage = item.thumbnail ? `url(${item.thumbnail})` : '';

      if ('trap' === item.kind) {
        elements.owned.textContent = getPowerType(item.stats);
        elements.powerType.hidden = !item.stats?.power_type;
        elements.powerType.style.backgroundImage = item.stats?.power_type ? `url(https://www.mousehuntgame.com/images/powertypes/${item.stats.power_type}.png)` : '';
      } else {
        elements.owned.textContent = quantity.toLocaleString();
      }

      // Only convertibles use the quantity. Disabled, it can't stop the form from sending when it's hidden.
      elements.quantity.disabled = 'convertible' !== item.kind;
      elements.quantity.max = quantity;
      if (Number.parseInt(elements.quantity.value, 10) > quantity) {
        elements.quantity.value = Math.max(1, quantity);
      }

      updateButtonLabel();
      elements.button.disabled = !canUse();
      elements.button.classList.toggle('disabled', elements.button.disabled);

      // Only show the aura while it's running.
      elements.aura.hidden = !isAuraActive();
      if (isAuraActive()) {
        elements.auraName.textContent = aura.name;
        elements.auraTime.textContent = `${getRemainingShort(auraExpiry)} left`;
      }
    }

    tab.render();
  };

  /**
   * Save the aura expiry.
   *
   * @param {number|null} expiry The expiry timestamp, or null when inactive.
   */
  const setAuraExpiry = (expiry) => {
    auraExpiry = expiry;
    sessionSet(getAuraCacheKey(), expiry);
    render();
  };

  /**
   * Update the aura expiry from an aura's status and expiry text.
   *
   * @param {string} status     The aura status.
   * @param {string} expiryText The rendered expiry date.
   */
  const updateAuraFromStatus = async (status, expiryText) => {
    if ('active' !== status) {
      setAuraExpiry(null);
      return;
    }

    const expiry = await parseMouseHuntDate(expiryText?.replaceAll('  ', ' ').trim());
    setAuraExpiry(expiry);
  };

  /**
   * Read the aura status from the trap image on the page, if it's there.
   */
  const updateAuraFromPage = async () => {
    if (!aura) {
      return;
    }

    const auraEl = document.querySelector(`.trapImageView-trapAura.${aura.type}`);
    if (!auraEl) {
      return;
    }

    const expiryText = auraEl.querySelector('.trapImageView-tooltip-trapAura-expiry span')?.textContent;
    await updateAuraFromStatus(auraEl.classList.contains('active') ? 'active' : 'inactive', expiryText);
  };

  /**
   * Update the owned quantity of the convertible.
   *
   * @param {boolean} forceUpdate Whether to skip the game's inventory cache.
   */
  const updateItem = async (forceUpdate = false) => {
    let userItem;
    try {
      userItem = (await getPinnedUserItems(forceUpdate)).get(itemType);
    } catch {
      return;
    }

    if (!userItem) {
      return;
    }

    item = Object.assign(item || {}, {
      type: itemType,
      itemId: userItem.item_id || item?.itemId,
      name: userItem.name,
      thumbnail: userItem.thumbnail_transparent || userItem.thumbnail || item?.thumbnail,
      quantity: Number.parseInt(userItem.quantity, 10) || 0,
    });

    // The item data doesn't include a message item's button text, but the inventory does.
    if (item.isMessageItem && userItem.buttonText) {
      item.actionVerb = userItem.buttonText;
    }

    render();
  };

  /**
   * Open the chosen quantity of the convertible.
   */
  const openConvertible = () => {
    if (isOpening || !item) {
      return;
    }

    const quantity = Number.parseInt(elements.quantity.value, 10);
    if (!quantity || quantity < 1) {
      showError(tab.result, 'Enter a quantity to open.');
      return;
    }

    if (quantity > item.quantity) {
      showError(tab.result, `You only have ${item.quantity.toLocaleString()}.`);
      return;
    }

    isOpening = true;
    tab.result.textContent = '';
    render();

    hg.utils.UserInventory.useConvertible(
      item.type,
      quantity,
      async (data) => {
        isOpening = false;
        showResult(tab.result, item, quantity, data);
        await updateItem(true);
        await updateAuraFromPage();
      },
      (data) => {
        isOpening = false;
        showError(tab.result, data?.error || data?.message || 'Something went wrong. Please try again.');
        render();
      }
    );
  };

  /**
   * Use a message item, like Scrambles, the same way the inventory page does.
   */
  const useMessageItem = () => {
    const inventoryPage = 'undefined' === typeof app ? null : app?.pages?.InventoryPage;
    if (!item || !inventoryPage?.useMessageItem) {
      showError(tab.result, 'Something went wrong. Please try again.');
      return;
    }

    tab.result.textContent = '';
    tab.el.classList.remove('expanded');

    // The inventory page reads the item type from the element's data attributes.
    const element = makeElement('div');
    element.dataset.itemType = item.type;
    inventoryPage.useMessageItem(element);
  };

  /**
   * Arm the weapon, base, bait, or charm, or disarm the bait or charm if it's armed.
   */
  const toggleArmed = () => {
    if (isOpening || !item || ('trap' === item.kind && isArmed())) {
      return;
    }

    const isDisarming = isArmed();
    isOpening = true;
    tab.result.textContent = '';
    tab.el.classList.add('mh-quick-items-menu-busy');
    render();

    /**
     * Show the new state once the game has answered.
     *
     * @param {boolean} isSuccess Whether it worked.
     */
    const done = (isSuccess) => {
      isOpening = false;
      tab.el.classList.remove('mh-quick-items-menu-busy');
      if (!isSuccess) {
        showError(tab.result, `Couldn't ${isDisarming ? 'disarm' : 'arm'} ${item.name}. Please try again.`);
      }

      render();
    };

    const control = isDisarming ? hg.utils.TrapControl.disarmItem(item.classification) : hg.utils.TrapControl.armItem(item.type, item.classification);
    control.go(
      () => done(true),
      () => done(false)
    );
  };

  /**
   * Open the potion's item view, where it can be brewed.
   */
  const brewPotion = () => {
    tab.el.classList.remove('expanded');
    hg.views.ItemView.show(item.type);
  };

  /**
   * Open the game's craft popup for the recipe.
   */
  const craftRecipe = () => {
    const inventoryPage = 'undefined' === typeof app ? null : app?.pages?.InventoryPage;
    if (!item?.recipe || !inventoryPage?.showConfirmPopup) {
      showError(tab.result, 'Something went wrong. Please try again.');
      return;
    }

    tab.result.textContent = '';
    tab.el.classList.remove('expanded');

    // The popup reads the recipe from the elements the Recipe Book shows it with.
    const element = makeElement('div', 'inventoryPage-item');
    element.dataset.itemType = item.recipe.type;
    element.dataset.producedItem = item.recipe.producedItem;
    element.dataset.producedQuantity = item.recipe.producedQuantity;
    for (const [partType, required] of Object.entries(item.recipe.parts)) {
      const part = make('div', 'inventoryPage-item-content-description-consumedItem', '', element);
      part.dataset.itemType = partType;
      part.dataset.itemRequired = required;
    }

    inventoryPage.showConfirmPopup(element, 'recipe');
  };

  /**
   * Do what the row's button does.
   */
  const use = () => {
    switch (item?.kind) {
      case 'convertible':
        openConvertible();
        break;
      case 'message':
        useMessageItem();
        break;
      case 'trap':
      case 'loadout':
        toggleArmed();
        break;
      case 'potion':
        brewPotion();
        break;
      case 'recipe':
        craftRecipe();
        break;
    }
  };

  /**
   * Build the dropdown row.
   *
   * @return {HTMLElement} The row.
   */
  const makeRow = () => {
    const row = makeElement('div', 'mh-quick-items-menu-item');

    elements.image = make('div', 'mh-quick-items-menu-image', '', row);

    elements.name = make('div', 'mh-quick-items-menu-name', '', row);

    const form = make('form', 'mh-quick-items-menu-form', '', row);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      use();
    });

    elements.quantity = make('input', 'mh-quick-items-menu-quantity');
    elements.quantity.type = 'number';
    elements.quantity.min = 1;
    elements.quantity.value = 1;
    elements.quantity.setAttribute('aria-label', 'Quantity');
    elements.quantity.addEventListener('input', updateButtonLabel);
    form.append(elements.quantity);

    makeElement('span', 'mh-quick-items-menu-separator', '/', form);
    elements.powerType = make('span', 'mh-quick-items-menu-power-type', '', form);
    elements.powerType.hidden = true;
    elements.owned = make('span', 'mh-quick-items-menu-owned', '', form);

    elements.button = makeMhButton({
      text: 'Open',
      size: 'tiny',
      element: 'button',
      className: 'mh-quick-items-menu-open',
      appendTo: form,
    });
    elements.button.type = 'submit';

    elements.aura = make('div', 'mh-quick-items-menu-aura', '', row);
    elements.aura.hidden = true;
    elements.auraName = make('span', 'mh-quick-items-menu-aura-name', '', elements.aura);
    elements.auraTime = make('span', 'mh-quick-items-menu-aura-time', '', elements.aura);

    return row;
  };

  /**
   * Load the convertible's details and aura.
   */
  const load = async () => {
    aura = auras[itemType] || null;
    auraExpiry = aura ? sessionGet(getAuraCacheKey(), null) : null;

    const [allItems, recipes] = await Promise.all([getData('items'), getRecipes()]);

    // Recipes aren't items, so they come from the user's Recipe Book instead.
    const recipe = recipes.get(itemType) || null;
    const itemData = !recipe && Array.isArray(allItems) ? allItems.find((i) => i.type === itemType) : null;
    const classification = recipe ? 'recipe' : itemData?.classification;
    const isMessageItem = 'message_item' === classification;

    item = {
      type: itemType,
      kind: kinds[classification] || 'convertible',
      classification,
      itemId: itemData?.id,
      name: recipe?.name || itemData?.name || itemType,
      thumbnail: recipe?.thumbnail || itemData?.images?.thumbnail,
      actionVerb: (isMessageItem ? itemData?.button_text : itemData?.action_verb) || (isMessageItem ? 'Use' : 'Open'),
      isMessageItem,
      stats: itemData?.has_stats,
      recipe,
      quantity: 0,
    };

    if (!pin.row) {
      pin.row = makeRow();
    }

    render();

    await updateItem();
    await updateAuraFromPage();
  };

  /**
   * Update the pin from a game response.
   *
   * @param {Object} response The response.
   */
  const onResponse = (response) => {
    if (!item) {
      return;
    }

    const inventoryItem = response?.inventory ? Object.values(response.inventory).find((i) => i?.type === item.type) : null;
    if (inventoryItem && undefined !== inventoryItem.quantity) {
      item.quantity = Number.parseInt(inventoryItem.quantity, 10) || 0;

      // Keep the cache in step so a pin reading it later doesn't go back to the old quantity.
      const cachedItem = userItemsCache?.items.get(item.type);
      if (cachedItem) {
        cachedItem.quantity = inventoryItem.quantity;
        saveUserItemsCache();
      }

      render();
    } else if (response?.user && ('trap' === item.kind || 'loadout' === item.kind)) {
      // What's armed can change from anywhere, like the camp page or another pin.
      render();
    }

    const auraData = aura ? response?.trap_image?.auras?.[aura.type] : null;
    if (auraData) {
      updateAuraFromStatus(auraData.status, auraData.expiry);
    }
  };

  return Object.assign(pin, {
    load,
    render,
    updateItem,
    updateAuraFromPage,
    onResponse,
    isAuraActive,
    isArmed,
    use,
    getItem: () => item,
    getItemType: () => itemType,
    getQuantity: () => item?.quantity || 0,
    getAuraExpiry: () => auraExpiry,
  });
};

/**
 * Close the dropdowns when clicking outside of them.
 *
 * @param {Event} event The click event.
 */
const closeOnOutsideClick = (event) => {
  for (const tab of tabs.values()) {
    if (!tab.el.contains(event.target)) {
      tab.el.classList.remove('expanded');
    }
  }
};

/**
 * Create a menu tab for a pin: one item with its own dropdown, or a group of them.
 *
 * @param {Object} pin The pin.
 *
 * @return {Object} The tab's controls.
 */
const createTab = (pin) => {
  const tab = { pin, entries: [] };

  tab.el = makeElement('div', ['menuItem', 'dropdown', 'mh-quick-items-menu']);
  tab.el.dataset.mhMenuPin = 'true';

  // Marked so Custom Menu can show the icon, the name, or both.
  const title = make('span', 'mh-quick-items-menu-title', '', tab.el);
  const icon = make('span', ['mh-quick-items-menu-tab-icon', 'mhui-menu-item-icon'], '', title);
  const label = make('span', ['mh-quick-items-menu-tab-label', 'mhui-menu-label'], '', title);
  const count = make('span', 'mh-quick-items-menu-tab-count', '', title);
  makeElement('div', 'arrow', '', tab.el);

  const dropdownContent = make('div', 'dropdownContent', '', tab.el);
  const content = make('div', 'mh-quick-items-menu-wrapper', '', dropdownContent);

  // Keep clicks inside the dropdown from toggling it.
  dropdownContent.addEventListener('click', (event) => event.stopPropagation());

  const list = make('div', 'mh-quick-items-menu-list', '', content);
  const empty = make('div', 'mh-quick-items-menu-none', 'Pick the items to pin in Custom Menu.', content);
  tab.result = make('div', 'mh-quick-items-menu-result', '', content);

  /**
   * Get the item to use straight from the tab, when the only item is a message item, weapon, or base.
   *
   * @return {Object|null} The item, or null if the tab should open the dropdown.
   */
  const getDirectEntry = () => {
    const [entry] = tab.entries;
    const kind = entry?.getItem()?.kind;
    return 1 === tab.entries.length && ('message' === kind || 'trap' === kind) ? entry : null;
  };

  /**
   * Update the tab to show its first item the user has, or its first item when they have none.
   */
  tab.render = () => {
    const rows = tab.entries.map((entry) => entry.row).filter(Boolean);
    if (rows.some((row, index) => list.children[index] !== row) || list.children.length !== rows.length) {
      list.replaceChildren(...rows);
    }

    empty.hidden = tab.entries.length > 0;

    const display = tab.entries.find((entry) => entry.getQuantity() > 0) || tab.entries[0];
    const item = display?.getItem();

    // Wait for the item to load rather than flashing the placeholder name.
    if (display && !item) {
      return;
    }

    // A group goes by the item it's showing.
    const name = item?.name || 'Pinned items';
    const iconImage = item?.thumbnail ? `url(${item.thumbnail})` : '';
    const isChanged = tab.shown !== `${name}|${iconImage}`;
    tab.shown = `${name}|${iconImage}`;

    label.textContent = name;
    tab.el.title = name;
    tab.el.dataset.mhMenuName = name;
    icon.style.backgroundImage = iconImage;

    // Custom Menu shows a copy of the tab, so let it know.
    if (isChanged && tab.el.isConnected) {
      doEvent('mh-improved-header-menu-changed');
    }

    tab.el.classList.toggle('mh-quick-items-menu-aura-active', Boolean(display?.isAuraActive()));
    tab.el.classList.toggle('mh-quick-items-menu-direct', Boolean(getDirectEntry()));
    tab.el.classList.toggle('mh-quick-items-menu-armed', 'trap' === item?.kind && Boolean(getDirectEntry()) && display.isArmed());

    if (display?.isAuraActive()) {
      count.textContent = getRemainingShort(display.getAuraExpiry());
    } else {
      // Message items, weapons, bases, and recipes aren't used up, so their quantity doesn't matter.
      count.textContent = item && countedKinds.has(item.kind) ? (item.quantity || 0).toLocaleString() : '';
    }
  };

  /**
   * Match the tab to its pin.
   *
   * @param {Object} newPin The pin.
   */
  tab.update = (newPin) => {
    const isSameItems = newPin.items.join(',') === tab.pin.items.join(',');
    tab.pin = newPin;

    // Keep the items it already has, so the tab doesn't go blank while the new ones load.
    if (!isSameItems || !tab.entries.length) {
      const oldEntries = new Map(tab.entries.map((entry) => [entry.getItemType(), entry]));
      tab.entries = newPin.items.map((itemType) => {
        const entry = oldEntries.get(itemType);
        oldEntries.delete(itemType);
        return entry || createEntry(itemType, tab);
      });

      tab.entries.filter((entry) => !entry.getItem()).forEach((entry) => entry.load());
    }

    tab.render();
  };

  tab.el.addEventListener('click', () => {
    const directEntry = getDirectEntry();
    if (directEntry) {
      directEntry.use();
      return;
    }

    const isExpanded = tab.el.classList.toggle('expanded');
    if (isExpanded) {
      tab.entries.forEach((entry) => entry.updateItem());

      // With only one convertible, select its quantity so Enter opens it straight away.
      if (1 === tab.entries.length && 'convertible' === tab.entries[0].getItem()?.kind) {
        const quantity = tab.entries[0].row?.querySelector('.mh-quick-items-menu-quantity');
        quantity?.focus({ preventScroll: true });
        quantity?.select();
      }
    }
  });

  return tab;
};

/**
 * Get every pinned item, across all the tabs.
 *
 * @return {Array} The items.
 */
const getEntries = () => [...tabs.values()].flatMap((tab) => tab.entries);

/**
 * Add, update, and remove tabs to match the pins.
 */
const syncTabs = () => {
  if (!document.querySelector('.mousehuntHeaderView-dropdownContainer')) {
    return;
  }

  const pins = getPins();
  for (const [id, tab] of tabs) {
    if (!pins.some((pin) => pin.id === id) || !tab.el.isConnected) {
      tab.el.remove();
      tabs.delete(id);
    }
  }

  for (const pin of pins) {
    let tab = tabs.get(pin.id);
    if (!tab) {
      tab = createTab(pin);
      tabs.set(pin.id, tab);
      tab.update(pin);
      addHeaderMenuTab(tab.el, { id: pin.id, name: tab.el.dataset.mhMenuName, order: 20 });
      continue;
    }

    tab.update(pin);
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, moduleId);

  syncTabs();
  document.addEventListener('click', closeOnOutsideClick);
  setInterval(() => getEntries().forEach((entry) => entry.render()), 30 * 1000);

  onNavigation(() => {
    syncTabs();
    getEntries().forEach((entry) => entry.updateAuraFromPage());
  });

  onRequest('*', (response) => getEntries().forEach((entry) => entry.onResponse(response)), true);

  // Pins are added and changed in Custom Menu.
  onEvent('mh-improved-pins-changed', syncTabs);

  // Keep the recipes that can be pinned up to date with what the user has unlocked.
  onNavigation(updateRecipesFromPage, { page: 'inventory', tab: 'crafting', subtab: 'recipe', onLoad: true });
};

/**
 * Initialize the module.
 */
export default {
  id: moduleId,
  type: 'inventory-shops',
  // Pins are added in Custom Menu, so there's nothing to turn on.
  alwaysLoad: true,
  load: init,
};
