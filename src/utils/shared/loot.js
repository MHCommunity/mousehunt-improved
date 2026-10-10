import { cacheGet, cacheSet, fetchMouseRip, getData } from '../data';
import { makeCollapsible } from '../collapsible';
import { makeElement } from '../elements';

// Drops at least this many times more likely than for the average mouse at the location. Charms,
// cheese and event loot that any mouse can drop sit near 1.
const minLift = 1.5;

const maxRows = 10;

// Items any mouse can drop, or that drop inconsistently, so their drop rates and droppers are noise.
const ignoredItemIds = new Set([
  412, // SUPER|brie+ Supply Pack.
  420, // King's Credits.
  585, // Scrambles.
  803, // Chrome Charm.
  823, // Party Charm.
  925, // Treasure Map Clue.
  1980, // King's Keys.
  2473, // Ful'Mina's Gift.
  2541, // Rift Luck Codex.
  2863, // Chrome Bit.
]);

/**
 * Check whether an item's drops are left out.
 *
 * @param {number|string} itemId The item ID.
 *
 * @return {boolean} Whether its drops are left out.
 */
const isIgnoredLootItem = (itemId) => ignoredItemIds.has(Number(itemId));

const inflightRequests = new Map();

/**
 * Get loot rows from the api, cached.
 *
 * @param {string} path The api path, `mouse-loot/<id>` or `item-droppers/<id>`.
 *
 * @return {Promise<Array>} The rows, empty when there aren't any.
 */
const getLootRows = async (path) => {
  const cacheKey = `loot-${path}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

  if (!inflightRequests.has(path)) {
    inflightRequests.set(
      path,
      fetchMouseRip(path)
        .then(async (rows) => {
          const valid = Array.isArray(rows) ? rows.filter((row) => row.lift >= minLift) : [];
          return valid.length ? cacheSet(cacheKey, valid) : valid;
        })
        .finally(() => inflightRequests.delete(path))
    );
  }

  return inflightRequests.get(path);
};

/**
 * Get a map of IDs to types for a data file.
 *
 * @param {string} file The data file, `items` or `mice`.
 *
 * @return {Promise<Map<number, string>>} The types by ID.
 */
const getTypesById = async (file) => {
  const records = await getData(file);
  return new Map((Array.isArray(records) ? records : []).map((record) => [Number(record.id), record.type]));
};

/**
 * Make an element holding text from the api.
 *
 * @param {string}           tag      The tag.
 * @param {string}           classes  The classes.
 * @param {string}           text     The text.
 * @param {HTMLElement|null} appendTo The element to append to.
 *
 * @return {HTMLElement} The element.
 */
const makeTextElement = (tag, classes, text, appendTo = null) => {
  const element = makeElement(tag, classes);
  element.textContent = text;
  appendTo?.append(element);
  return element;
};

/**
 * Format a drop's quantity range.
 *
 * @param {Object} row The loot row.
 *
 * @return {string} The quantity, like `1` or `1–3`.
 */
const formatQuantity = (row) => (row.min === row.max ? `${row.min}` : `${row.min}–${row.max}`);

/**
 * Make a link that opens a mouse or item popup.
 *
 * @param {string}      text The link text.
 * @param {string|null} type The mouse or item type.
 * @param {string}      view The view to open, `MouseView` or `ItemView`.
 *
 * @return {HTMLElement} The link, or plain text when the type is unknown.
 */
const makeViewLink = (text, type, view) => {
  if (!type) {
    return makeTextElement('div', 'name', text);
  }

  const link = makeTextElement('a', 'name', text);
  link.href = '#';
  link.addEventListener('click', (e) => {
    e.preventDefault();
    hg.views[view].show(type);
  });

  return link;
};

/**
 * Make an empty, collapsible loot section.
 *
 * @param {string} title The section title.
 * @param {string} key   The collapsible section key.
 *
 * @return {Object} The section and its header.
 */
const makeLootSection = (title, key) => {
  const section = makeElement('div', ['ar-wrapper', 'mh-improved-loot']);
  const header = makeElement('div', 'ar-header');
  makeElement('div', 'ar-title', title, header);
  section.append(header);
  makeCollapsible({ key, section, header });

  return { section, header };
};

/**
 * Make the list of a mouse's drops at one location.
 *
 * @param {Array}               rows       The location's rows.
 * @param {Map<number, string>} itemTypes  Item types by ID.
 *
 * @return {HTMLElement} The list.
 */
const makeMouseLootList = (rows, itemTypes) => {
  const list = makeElement('div', ['item-ar-wrapper', 'mh-improved-loot-list']);
  rows.slice(0, maxRows).forEach((row) => {
    const rowEl = makeElement('div', 'mouse-ar-wrapper');
    rowEl.append(makeViewLink(row.item_name, itemTypes.get(row.item_id), 'ItemView'));
    makeElement('div', 'quantity', formatQuantity(row), rowEl);
    makeElement('div', 'rate', `${row.drop_likelihood}%`, rowEl);
    list.append(rowEl);
  });

  return list;
};

/**
 * Make the section listing what a mouse drops, for its most caught location with a picker for the
 * others.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {Promise<HTMLElement|null>} The section, or null without drops.
 */
const makeMouseLootSection = async (mouseId) => {
  const [allRows, itemTypes] = await Promise.all([getLootRows(`mouse-loot/${mouseId}`), getTypesById('items')]);
  const rows = allRows.filter((row) => !isIgnoredLootItem(row.item_id));
  if (!rows.length) {
    return null;
  }

  // Locations come most caught first.
  const byLocation = new Map();
  rows.forEach((row) => {
    byLocation.set(row.location, [...(byLocation.get(row.location) || []), row]);
  });

  const { section, header } = makeLootSection('Loot', 'mouse-view.loot');
  let list = makeMouseLootList(byLocation.values().next().value, itemTypes);

  if (byLocation.size > 1) {
    const picker = makeElement('select', 'mh-improved-loot-location');
    byLocation.forEach((locationRows, location) => {
      const option = makeTextElement('option', '', location);
      option.value = location;
      picker.append(option);
    });

    picker.addEventListener('change', () => {
      const newList = makeMouseLootList(byLocation.get(picker.value), itemTypes);
      list.replaceWith(newList);
      list = newList;
    });

    header.append(picker);
  } else {
    makeTextElement('div', 'mh-improved-loot-location', byLocation.keys().next().value, header);
  }

  section.append(list);
  return section;
};

/**
 * Make the section listing the mice that drop an item, most likely first.
 *
 * @param {string} itemId The item ID.
 *
 * @return {Promise<HTMLElement|null>} The section, or null without droppers.
 */
const makeItemDroppersSection = async (itemId) => {
  if (isIgnoredLootItem(itemId)) {
    return null;
  }

  const [rows, mouseTypes] = await Promise.all([getLootRows(`item-droppers/${itemId}`), getTypesById('mice')]);
  if (!rows.length) {
    return null;
  }

  const { section, header } = makeLootSection('Dropped by', 'item-view.dropped-by');
  makeElement('div', 'mh-improved-loot-unit', 'Per catch', header);
  const list = makeElement('div', ['item-ar-wrapper', 'mh-improved-loot-list', 'has-location']);
  rows.slice(0, maxRows).forEach((row) => {
    const rowEl = makeElement('div', 'mouse-ar-wrapper');
    rowEl.append(makeViewLink(row.mouse_name.replace(/ Mouse$/, ''), mouseTypes.get(row.mouse_id), 'MouseView'));
    makeTextElement('div', 'location', row.location, rowEl);
    makeElement('div', 'rate', `${row.drop_likelihood}%`, rowEl);
    list.append(rowEl);
  });

  section.append(list);
  return section;
};

/**
 * Get the mice that drop an item, most likely first, with each mouse's type added.
 *
 * @param {number|string} item The item ID or type.
 *
 * @return {Promise<Array>} The rows, empty when there aren't any.
 */
const getItemDroppers = async (item) => {
  if (isIgnoredLootItem(item)) {
    return [];
  }

  const [rows, mouseTypes] = await Promise.all([getLootRows(`item-droppers/${item}`), getTypesById('mice')]);
  return rows.map((row) => ({ ...row, mouse_type: mouseTypes.get(row.mouse_id) || null }));
};

export { getItemDroppers, isIgnoredLootItem, makeItemDroppersSection, makeMouseLootSection };
