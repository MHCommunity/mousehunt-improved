import {
  addHeaderMenuTab,
  addStyles,
  getData,
  getMultiSelectSetting,
  getUserItems,
  isModuleEnabled,
  make,
  makeElement,
  makeMhButton,
  onModuleToggle,
  onNavigation,
  onEvent,
  onRequest,
  parseMouseHuntDate,
  sessionGet,
  sessionSet,
} from '@utils';

import settings, { defaultItemType } from './settings';

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

let menuTab = null;
let tabElements = {};
let pins = [];
let renderTimer = null;
let userItemsCache = null;
let userItemsRequest = null;

// How long the pinned items' inventory data is reused before it's fetched again.
const userItemsCacheTtl = 60 * 1000;

/**
 * Get the item type pinned in a slot.
 *
 * @param {number} slot The slot index.
 *
 * @return {string|null} The item type, or null if the slot is empty.
 */
const getSlotItemType = (slot) => {
  const values = getMultiSelectSetting(`${moduleId}.item`, [defaultItemType]);
  const value = values[slot];
  if (!value || 'none' === value) {
    return null;
  }

  // The same convertible pinned twice is only listed once.
  return values.indexOf(value) === slot ? value : null;
};

/**
 * Get every item type that's pinned, without duplicates.
 *
 * @return {string[]} The item types.
 */
const getPinnedItemTypes = () => {
  const values = getMultiSelectSetting(`${moduleId}.item`, [defaultItemType]);
  return [...new Set(values.filter((value) => value && 'none' !== value))];
};

/**
 * Get the user's inventory data for every pinned item in one request, cached and shared between the pins.
 *
 * @param {boolean} forceUpdate Whether to skip the cache.
 *
 * @return {Promise<Map>} The inventory data, keyed by item type.
 */
const getPinnedUserItems = async (forceUpdate = false) => {
  const types = getPinnedItemTypes();
  const key = types.join(',');

  const isCacheFresh = userItemsCache?.key === key && Date.now() - userItemsCache.fetchedAt < userItemsCacheTtl;
  if (!forceUpdate && isCacheFresh) {
    return userItemsCache.items;
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
 * @param {Object} item     The convertible.
 * @param {number} quantity The number opened.
 * @param {Object} data     The response from the server.
 */
const showResult = (item, quantity, data) => {
  const result = tabElements.result;
  if (!result) {
    return;
  }

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
 * @param {string} message The message.
 */
const showError = (message) => {
  const result = tabElements.result;
  if (!result) {
    return;
  }

  result.innerHTML = '';
  result.classList.add('error');
  result.textContent = message;
};

/**
 * Get the pin to use straight from the tab, when the only thing pinned is a message item.
 *
 * @return {Object|null} The pin, or null if the tab should open the dropdown.
 */
const getDirectPin = () => {
  const pinned = pins.filter((pin) => pin.getItem());

  return 1 === pinned.length && pinned[0].getItem().isMessageItem ? pinned[0] : null;
};

/**
 * Update the menu tab to show the first pinned item the user has.
 */
const renderTab = () => {
  if (!menuTab) {
    return;
  }

  // Keep the rows in slot order without moving them (and blurring inputs) when they're already in place.
  const rows = pins.map((pin) => pin.row).filter(Boolean);
  if (rows.some((row, index) => tabElements.list.children[index] !== row) || tabElements.list.children.length !== rows.length) {
    tabElements.list.replaceChildren(...rows);
  }

  const display = pins.find((pin) => pin.getQuantity() > 0);

  menuTab.classList.toggle('mh-quick-items-menu-empty', !display);
  menuTab.classList.toggle('mh-quick-items-menu-aura-active', Boolean(display?.isAuraActive()));
  menuTab.classList.toggle('mh-quick-items-menu-direct', Boolean(getDirectPin()));

  if (!display) {
    menuTab.classList.remove('expanded');
    return;
  }

  const item = display.getItem();
  tabElements.title.title = item.name;
  tabElements.tabIcon.style.backgroundImage = item.thumbnail ? `url(${item.thumbnail})` : '';
  tabElements.tabName.textContent = item.name;
  if (display.isAuraActive()) {
    tabElements.tabCount.textContent = getRemainingShort(display.getAuraExpiry());
  } else {
    // Message items aren't used up, so their quantity doesn't matter.
    tabElements.tabCount.textContent = item.isMessageItem ? '' : item.quantity.toLocaleString();
  }
};

/**
 * Create one pinned item, shown as a row in the dropdown.
 *
 * @param {number} slot The slot index.
 *
 * @return {Object} The pin's controls.
 */
const createPin = (slot) => {
  let itemType = null;
  let item = null;
  let aura = null;
  let auraExpiry = null;
  let isOpening = false;
  let elements = {};

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
    if (item?.isMessageItem) {
      elements.button.querySelector('span').textContent = item.actionVerb;
      return;
    }

    const quantity = Number.parseInt(elements.quantity.value, 10);
    elements.button.querySelector('span').textContent = `${item?.actionVerb || 'Open'}${quantity > 0 ? ` ${quantity.toLocaleString()}` : ''}`;
  };

  /**
   * Update the row to match the current state.
   */
  const render = () => {
    if (pin.row && item) {
      const quantity = item.quantity || 0;

      pin.row.hidden = quantity < 1;
      pin.row.classList.toggle('mh-quick-items-menu-message-item', item.isMessageItem);

      elements.name.textContent = item.name;
      elements.name.title = item.name;
      elements.owned.textContent = quantity.toLocaleString();
      elements.image.style.backgroundImage = item.thumbnail ? `url(${item.thumbnail})` : '';

      elements.quantity.max = quantity;
      if (Number.parseInt(elements.quantity.value, 10) > quantity) {
        elements.quantity.value = Math.max(1, quantity);
      }

      updateButtonLabel();
      elements.button.disabled = isOpening || quantity < 1;
      elements.button.classList.toggle('disabled', elements.button.disabled);

      // Only show the aura while it's running.
      elements.aura.hidden = !isAuraActive();
      if (isAuraActive()) {
        elements.auraName.textContent = aura.name;
        elements.auraTime.textContent = `${getRemainingShort(auraExpiry)} left`;
      }
    }

    renderTab();
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
    const type = itemType;
    if (!type) {
      return;
    }

    let userItem;
    try {
      userItem = (await getPinnedUserItems(forceUpdate)).get(type);
    } catch {
      return;
    }

    if (!userItem || type !== itemType) {
      return;
    }

    item = Object.assign(item || {}, {
      type,
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
      showError('Enter a quantity to open.');
      return;
    }

    if (quantity > item.quantity) {
      showError(`You only have ${item.quantity.toLocaleString()}.`);
      return;
    }

    isOpening = true;
    tabElements.result.textContent = '';
    render();

    hg.utils.UserInventory.useConvertible(
      item.type,
      quantity,
      async (data) => {
        isOpening = false;
        showResult(item, quantity, data);
        await updateItem(true);
        await updateAuraFromPage();
      },
      (data) => {
        isOpening = false;
        showError(data?.error || data?.message || 'Something went wrong. Please try again.');
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
      showError('Something went wrong. Please try again.');
      return;
    }

    if (tabElements.result) {
      tabElements.result.textContent = '';
    }

    menuTab?.classList.remove('expanded');

    // The inventory page reads the item type from the element's data attributes.
    const element = makeElement('div');
    element.dataset.itemType = item.type;
    inventoryPage.useMessageItem(element);
  };

  /**
   * Build the dropdown row.
   *
   * @return {HTMLElement} The row.
   */
  const makeRow = () => {
    const row = makeElement('div', 'mh-quick-items-menu-item');
    row.hidden = true;

    elements.image = make('div', 'mh-quick-items-menu-image', '', row);

    elements.name = make('div', 'mh-quick-items-menu-name', '', row);

    const form = make('form', 'mh-quick-items-menu-form', '', row);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (item?.isMessageItem) {
        useMessageItem();
      } else {
        openConvertible();
      }
    });

    elements.quantity = make('input', 'mh-quick-items-menu-quantity');
    elements.quantity.type = 'number';
    elements.quantity.min = 1;
    elements.quantity.value = 1;
    elements.quantity.setAttribute('aria-label', 'Quantity');
    elements.quantity.addEventListener('input', updateButtonLabel);
    form.append(elements.quantity);

    makeElement('span', 'mh-quick-items-menu-separator', '/', form);
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
    itemType = getSlotItemType(slot);

    if (!itemType) {
      item = null;
      aura = null;
      pin.row = null;
      elements = {};
      renderTab();
      return;
    }

    aura = auras[itemType] || null;
    auraExpiry = aura ? sessionGet(getAuraCacheKey(), null) : null;

    const type = itemType;
    const allItems = await getData('items');
    if (type !== itemType) {
      return;
    }

    const itemData = Array.isArray(allItems) ? allItems.find((i) => i.type === itemType) : null;
    const isMessageItem = 'message_item' === itemData?.classification;

    item = {
      type: itemType,
      name: itemData?.name || itemType,
      thumbnail: itemData?.images?.thumbnail,
      actionVerb: (isMessageItem ? itemData?.button_text : itemData?.action_verb) || (isMessageItem ? 'Use' : 'Open'),
      isMessageItem,
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
      }

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
    useMessageItem,
    getItem: () => item,
    getQuantity: () => item?.quantity || 0,
    getAuraExpiry: () => auraExpiry,
  });
};

/**
 * Close the dropdown when clicking outside of it.
 *
 * @param {Event} event The click event.
 */
const closeOnOutsideClick = (event) => {
  if (menuTab && !menuTab.contains(event.target)) {
    menuTab.classList.remove('expanded');
  }
};

/**
 * Build the menu tab.
 *
 * @return {HTMLElement} The menu tab.
 */
const makeMenuTab = () => {
  const tab = makeElement('div', ['menuItem', 'dropdown', 'mh-quick-items-menu', 'mh-quick-items-menu-empty']);

  tabElements.title = make('span', 'mh-quick-items-menu-title', '', tab);
  // Marked so Custom Menu can show the icon, the name, or both.
  tabElements.tabIcon = make('span', ['mh-quick-items-menu-tab-icon', 'mhui-menu-item-icon'], '', tabElements.title);
  // Shows "Quick Items", or the first item's name when that's turned on in Custom Menu.
  const tabLabel = make('span', ['mh-quick-items-menu-tab-label', 'mhui-menu-label'], '', tabElements.title);
  make('span', 'mh-quick-items-menu-tab-label-default', 'Quick Items', tabLabel);
  tabElements.tabName = make('span', 'mh-quick-items-menu-tab-name', '', tabLabel);
  tabElements.tabCount = make('span', 'mh-quick-items-menu-tab-count', '', tabElements.title);
  makeElement('div', 'arrow', '', tab);

  const dropdownContent = make('div', 'dropdownContent');
  const content = make('div', 'mh-quick-items-menu-wrapper', '', dropdownContent);

  // Keep clicks inside the dropdown from toggling it.
  dropdownContent.addEventListener('click', (event) => event.stopPropagation());

  tabElements.list = make('div', 'mh-quick-items-menu-list', '', content);
  tabElements.result = make('div', 'mh-quick-items-menu-result', '', content);

  tab.append(dropdownContent);

  tab.addEventListener('click', () => {
    const directPin = getDirectPin();
    if (directPin) {
      directPin.useMessageItem();
      return;
    }

    const isExpanded = tab.classList.toggle('expanded');
    if (isExpanded) {
      pins.forEach((pin) => pin.updateItem());
    }
  });

  return tab;
};

/**
 * Add the menu tab to the header.
 */
const addMenuTab = () => {
  if (menuTab?.isConnected) {
    return;
  }

  if (!document.querySelector('.mousehuntHeaderView-dropdownContainer')) {
    return;
  }

  menuTab = makeMenuTab();
  addHeaderMenuTab(menuTab, { id: 'quick-items-menu', name: 'Quick Items', order: 20 });

  document.addEventListener('click', closeOnOutsideClick);

  renderTab();
};

/**
 * Remove the menu tab from the header.
 */
const removeMenuTab = () => {
  menuTab?.remove();
  menuTab = null;
  tabElements = {};

  document.removeEventListener('click', closeOnOutsideClick);
};

/**
 * Load every pinned item.
 */
const loadPins = () => {
  // Pins can be added in the settings, so match the number of slots first.
  const count = getMultiSelectSetting(`${moduleId}.item`, [defaultItemType]).length;
  pins = pins.slice(0, count);
  for (let slot = pins.length; slot < count; slot++) {
    pins.push(createPin(slot));
  }

  pins.forEach((pin) => pin.load());
};

/**
 * Show the quick items tab.
 */
const enable = () => {
  addMenuTab();
  loadPins();

  clearInterval(renderTimer);
  renderTimer = setInterval(() => pins.forEach((pin) => pin.render()), 30 * 1000);
};

/**
 * Hide the quick items tab.
 */
const disable = () => {
  clearInterval(renderTimer);
  removeMenuTab();
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, moduleId);

  enable();

  onNavigation(() => {
    if (isModuleEnabled(moduleId)) {
      addMenuTab();
      pins.forEach((pin) => pin.updateAuraFromPage());
    }
  });

  onRequest('*', (response) => pins.forEach((pin) => pin.onResponse(response)), true);

  // Changing one slot can change which slots are duplicates, so reload them all.
  onEvent('mh-improved-settings-changed', ({ key }) => {
    if (key?.startsWith(`${moduleId}.item-`)) {
      loadPins();
    }
  });

  onModuleToggle(moduleId, { enable, disable });
};

/**
 * Initialize the module.
 */
export default {
  id: moduleId,
  name: 'Quick Items Menu',
  type: 'inventory-shops',
  default: false,
  liveToggle: true,
  description: 'Add a Quick Items menu to the top menu for opening pinned items.',
  load: init,
  settings,
};
