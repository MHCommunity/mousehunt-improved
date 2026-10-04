import { getData } from './data';

// Below this many options, a list (or a group within it) isn't worth splitting up.
const minimumGroupSize = 20;

// Groups are listed in this order, with anything else after them and "Other" last.
const groupOrder = [
  'Cheese',
  'Charms',
  'Convertibles',
  'Crafting',
  'Special',
  'Potions',
  'Skins',
  'Collectibles',
  'General',
  'Locations',
  'Rift',
  'Events',
  'Treasure Chests',
  'Treasure Maps',
  'Eggs',
  'Scroll Cases',
  'Gift Baskets',
  'Kits & Packs',
  'Message Items',
  'Resources',
  'Currency',
  'Cosmetics',
];

const eventTags = new Set(['halloween', 'great_winter_hunt', 'valentines', 'mousehunt_birthday', 'spring_hunt', 'lunar_new_year']);

// Tags that don't say where an item is from.
const genericTags = new Set(['bait', 'bait_standard', 'trinket', 'convertible', 'convertibles', 'message_item', 'crafting_item', 'stat', 'skin', 'potion', 'collectible']);

const specialGroups = { resources: 'Resources', currency: 'Currency', cosmetics: 'Cosmetics' };

// Names of things from events, as event chests, kits, and baskets don't have event tags.
const eventNamePattern =
  /^\d{4} |\b\d{4}\b|halloween|pumpkin|spooky|haunted|birthday|party|naughty|\bnice\b|valentine|new year|year of the|lunar|gilded|spring|egg|great winter|festive/i;

/**
 * Get the group for an item that comes from a location or event, like a charm.
 *
 * @param {Set} tags The item's tags.
 *
 * @return {string} The group name.
 */
const getSourceGroup = (tags) => {
  if ([...tags].some((tag) => 'rift' === tag || tag.startsWith('rift_'))) {
    return 'Rift';
  }

  if ([...tags].some((tag) => eventTags.has(tag))) {
    return 'Events';
  }

  if ([...tags].some((tag) => !genericTags.has(tag))) {
    return 'Locations';
  }

  return 'General';
};

/**
 * Get the groups for a convertible or message item.
 *
 * @param {Object} item The item.
 * @param {Set}    tags The item's tags.
 *
 * @return {Array} The group names.
 */
const getConvertibleGroups = (item, tags) => {
  if ('message_item' === item.classification) {
    return ['Message Items'];
  }

  const isEvent = eventNamePattern.test(item.name);

  if (tags.has('treasure_chests') || /treasure (chest|trove)/i.test(item.name)) {
    return ['Treasure Chests', isEvent ? 'Events' : 'Treasure Maps'];
  }

  if (tags.has('scroll_case')) {
    return ['Scroll Cases'];
  }

  if (tags.has('spring_hunt') || /\begg$/i.test(item.name)) {
    return ['Eggs'];
  }

  // Most convertibles only have the generic tag, so the rest are sorted by name.
  if (/basket|\bgift\b/i.test(item.name)) {
    return ['Gift Baskets', isEvent ? 'Events' : 'Other'];
  }

  if (/\b(kit|pack|bundle|box|bag|ship|set)\b/i.test(item.name)) {
    return ['Kits & Packs', isEvent ? 'Events' : 'Other'];
  }

  return ['Other'];
};

/**
 * Get the groups an item belongs in, from the outermost in.
 *
 * @param {Object} item The item's data.
 *
 * @return {Array} The group names.
 */
const getItemGroups = (item) => {
  const tags = new Set(item?.tags || []);

  switch (item?.classification) {
    case 'bait':
      return ['Cheese'];
    case 'trinket':
      return ['Charms', getSourceGroup(tags)];
    case 'convertible':
    case 'message_item':
      return ['Convertibles', ...getConvertibleGroups(item, tags)];
    case 'crafting_item':
      return ['Crafting'];
    case 'stat':
      return ['Special', Object.entries(specialGroups).find(([tag]) => tags.has(tag))?.[1] ?? 'Other'];
    case 'potion':
      return ['Potions'];
    case 'skin':
      return ['Skins'];
    case 'collectible':
      return ['Collectibles'];
    default:
      return ['Other'];
  }
};

/**
 * Get where a group goes in the group order.
 *
 * @param {string} name The group name.
 *
 * @return {number} The rank.
 */
const getGroupRank = (name) => {
  if ('Other' === name) {
    return Infinity;
  }

  const index = groupOrder.indexOf(name);
  return -1 === index ? groupOrder.length : index;
};

/**
 * Sort group names by the group order.
 *
 * @param {string} a The first name.
 * @param {string} b The second name.
 *
 * @return {number} The sort order.
 */
const compareGroups = (a, b) => getGroupRank(a) - getGroupRank(b) || a.localeCompare(b);

/**
 * Make an empty group.
 *
 * @param {string} name The group name.
 *
 * @return {Object} The group.
 */
const makeNode = (name) => ({ name, options: [], groups: new Map() });

/**
 * Get every option in a group, including its subgroups.
 *
 * @param {Object} node The group.
 *
 * @return {Array} The options.
 */
const collectOptions = (node) => [...node.options, ...[...node.groups.values()].flatMap((group) => collectOptions(group))];

/**
 * Count the options in a group, including its subgroups.
 *
 * @param {Object} node The group.
 *
 * @return {number} The count.
 */
const countOptions = (node) => node.options.length + [...node.groups.values()].reduce((total, group) => total + countOptions(group), 0);

/**
 * Turn a group into setting options, flattening it when it's too small to split up.
 *
 * @param {Object}  node      The group.
 * @param {boolean} collapsed Whether its subgroups start collapsed.
 *
 * @return {Array} The options.
 */
const toOptions = (node, collapsed) => {
  // A group with just one group in it, like a list that's all convertibles, skips to the inner one.
  if (1 === node.groups.size && !node.options.length) {
    return toOptions([...node.groups.values()][0], collapsed);
  }

  if (!node.groups.size || countOptions(node) < minimumGroupSize) {
    return collectOptions(node).sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...node.groups.values()]
    .sort((a, b) => compareGroups(a.name, b.name))
    .map((group) => ({
      name: group.name,
      value: 'group',
      collapsed,
      options: toOptions(group, true),
    }))
    .concat(node.options);
};

/**
 * Sort item options into nested groups by what kind of item they are, like Charms › Rift.
 *
 * Options are matched to items by their `type`, or their `value` if they don't have one. "None"
 * stays at the top, separators are dropped, and short lists are returned as they are.
 *
 * @param {Array} options The setting options.
 *
 * @return {Promise<Array>} The grouped options.
 */
const groupItemOptions = async (options) => {
  const choices = options.filter((option) => !option.seperator && 'none' !== option.value && 'group' !== option.value);
  if (choices.length < minimumGroupSize) {
    return options;
  }

  const items = await getData('items');
  const itemsByType = new Map((Array.isArray(items) ? items : []).map((item) => [item.type, item]));

  const root = makeNode(null);

  for (const option of choices) {
    let node = root;
    for (const name of getItemGroups(itemsByType.get(option.type ?? option.value))) {
      if (!node.groups.has(name)) {
        node.groups.set(name, makeNode(name));
      }

      node = node.groups.get(name);
    }

    node.options.push(option);
  }

  // Leave the top-level groups open on shorter lists, so they read like a list with headings.
  const grouped = toOptions(root, choices.length > 60);

  return [...options.filter((option) => 'none' === option.value), ...grouped];
};

export { groupItemOptions };
