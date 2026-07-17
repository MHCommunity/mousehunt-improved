import abbreviations from './item-abbreviations.json';

/**
 * Items whose generated acronym would be noise rather than a useful search term.
 */
const excluded = /airship|theme scrap|journal theme|blueprint/i;

/**
 * The marker wrapped around search terms that get appended to an item's name.
 *
 * The trap selector filters on a substring of the item name and renders that same name escaped, so
 * the terms have to live in the name and be stripped back out before they're displayed.
 */
const tagStart = '#mhui-search:';
const tagEnd = '#';
const tagRegex = /#mhui-search:[^#]*#/g;

/**
 * The shortest acronym worth generating.
 *
 * Two-letter acronyms match far too much to be useful: generating them turns every 'X Cheese' into
 * an 'XC', which buries the abbreviations people actually search for. 'SB' should find SUPER|brie+,
 * not also Stone Base and Sleigh Bell.
 */
const minAcronymLength = 3;

/**
 * Build an acronym from the first letter of each word in an item's name.
 *
 * @param {string} name The item name.
 *
 * @return {string|null} The acronym, or null if one can't usefully be made.
 */
const getAcronym = (name) => {
  // Parenthesised asides aren't part of what anyone abbreviates, and letting them through turns
  // 'Satchel of Gold (10,000 gold)' into 'SOG(G'.
  const words = name
    .replaceAll(/\(.*?\)/g, ' ')
    .split(' ')
    .filter(Boolean);

  const acronym = words
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  return acronym.length >= minAcronymLength ? acronym : null;
};

/**
 * Get the search terms for an item.
 *
 * An item's terms come from `item-abbreviations.json` if it has an entry there, otherwise an
 * acronym is generated from its name.
 *
 * @param {string} type The item type.
 * @param {string} name The item name.
 *
 * @return {Array} The search terms, which may be empty.
 */
const getSearchTerms = (type, name) => {
  if (abbreviations[type]) {
    return abbreviations[type];
  }

  if (!name || excluded.test(name)) {
    return [];
  }

  // 'Rift 2025 Charm' should be found by 'R2025', not by the 'R2C' its initials would give.
  const riftYear = name.match(/^Rift (20\d{2}) Charm$/);
  if (riftYear) {
    return [`R${riftYear[1]}`];
  }

  const acronym = getAcronym(name);

  return acronym ? [acronym] : [];
};

/**
 * Get an item's search terms as a single string.
 *
 * @param {string} type The item type.
 * @param {string} name The item name.
 *
 * @return {string} The search terms, or an empty string if the item has none.
 */
const getSearchTermString = (type, name) => {
  return getSearchTerms(type, name).join(' ');
};

/**
 * Append an item's search terms to its name, wrapped in a marker so they can be stripped later.
 *
 * @param {string} type The item type.
 * @param {string} name The item name.
 *
 * @return {string} The tagged name, unchanged if the item has no terms or is already tagged.
 */
const addSearchTermsToName = (type, name) => {
  if (!name || name.includes(tagStart)) {
    return name;
  }

  const terms = getSearchTermString(type, name);

  return terms ? `${name}${tagStart}${terms}${tagEnd}` : name;
};

/**
 * Remove the search terms added by addSearchTermsToName().
 *
 * @param {string} text The text to strip the terms from.
 *
 * @return {string} The text without the search terms.
 */
const removeSearchTerms = (text) => {
  return 'string' === typeof text ? text.replaceAll(tagRegex, '') : text;
};

export { addSearchTermsToName, getSearchTerms, getSearchTermString, removeSearchTerms };
