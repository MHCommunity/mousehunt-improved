import { deleteSetting, getMultiSelectSetting, getSettingDirect, getTradableItems, saveSetting } from '@utils';

const pinnedItemsSetting = 'send-supplies-settings.pinned-items';

const defaultPinnedItems = [
  { name: 'SUPER|brie+', value: 'super_brie_cheese' },
  { name: 'Empowered SUPER|brie+', value: 'toxic_super_brie_cheese' },
  { name: 'Rift Cherries', value: 'rift_cherries_crafting_item' },
  { name: 'Rift-torn Roots', value: 'rift_torn_roots_crafting_item' },
  { name: 'Sap-filled Thorns', value: 'wicked_thorns_crafting_item' },
  { name: 'Rare Map Dust', value: 'rare_map_dust_stat_item' },
  { name: 'Adorned Empyrean Jewel', value: 'floating_trap_upgrade_stat_item' },
];

const legacyLists = [
  { key: 'better-send-supplies.pinned-items', defaults: ['SUPER|brie+', 'Empowered SUPER|b...', 'Rift Cherries', 'Rift-torn Roots', 'Sap-filled Thorns'] },
  { key: 'quick-send-supplies.items', defaults: ['super_brie_cheese', 'rare_map_dust_stat_item', 'floating_trap_upgrade_stat_item', 'rift_torn_roots_crafting_item'] },
];

/**
 * Find the saved slots and count for a pinned-item list, including explicitly empty lists.
 *
 * @param {string} key The list's setting key.
 * @return {string[]} The saved child keys.
 */
const getSavedListKeys = (key) => {
  const [moduleId, listId] = key.split('.');
  const settings = getSettingDirect(`${moduleId}-settings`, {});
  return Object.keys(settings).filter((childKey) => childKey.startsWith(`${listId}-`) && /^(count|\d+)$/.test(childKey.slice(listId.length + 1)));
};

/**
 * Read the shared pins, migrating customized legacy lists into item types on first use.
 * Untouched legacy lists contribute no defaults to a hunter's customized list.
 *
 * @param {Object[]} tradableItems Optional catalog already fetched by the caller.
 * @return {Promise<string[]>} The pinned item types, or unresolved legacy names until the catalog is available.
 */
const getPinnedSupplyItems = async (tradableItems) => {
  const readSharedList = () =>
    getMultiSelectSetting(
      pinnedItemsSetting,
      defaultPinnedItems.map((item) => item.value)
    ).filter((value) => value && 'none' !== value);
  if (getSavedListKeys(pinnedItemsSetting).length) {
    return readSharedList();
  }

  const customizedLists = legacyLists.filter(({ key }) => getSavedListKeys(key).length);
  if (!customizedLists.length) {
    return readSharedList();
  }

  const legacyItems = customizedLists.flatMap(({ key, defaults }) => getMultiSelectSetting(key, defaults)).filter((value) => value && 'none' !== value);
  const namesToTypes = new Map(defaultPinnedItems.map(({ name, value }) => [name, [value]]));
  namesToTypes.set('Empowered SUPER|b...', ['toxic_super_brie_cheese']);
  const legacyNames = customizedLists.some(({ key }) => key === 'better-send-supplies.pinned-items')
    ? getMultiSelectSetting(legacyLists[0].key, legacyLists[0].defaults).filter((value) => value && 'none' !== value)
    : [];

  if (legacyNames.some((name) => !namesToTypes.has(name))) {
    const catalog = tradableItems ?? (await getTradableItems('all'));
    for (const item of catalog) {
      for (const name of [item.name, item.truncated_name]) {
        const types = namesToTypes.get(name) ?? [];
        namesToTypes.set(name, [...new Set([...types, item.type])]);
      }
    }
  }

  // A legacy truncated name can refer to several items; the full page used to pin all of them.
  const pinnedItems = [...new Set(legacyItems.flatMap((value) => namesToTypes.get(value) ?? [value]))];
  // Another caller or the settings editor may have saved the shared list during the catalog fetch.
  if (getSavedListKeys(pinnedItemsSetting).length) {
    return readSharedList();
  }

  // Keep the legacy settings intact when a name cannot be resolved, and retry on the next read.
  if (legacyNames.some((name) => !namesToTypes.has(name))) {
    return pinnedItems;
  }

  pinnedItems.forEach((value, slot) => saveSetting(`${pinnedItemsSetting}-${slot}`, value));
  saveSetting(`${pinnedItemsSetting}-count`, pinnedItems.length);
  for (const { key } of customizedLists) {
    const [moduleId] = key.split('.');
    for (const childKey of getSavedListKeys(key)) {
      deleteSetting(`${moduleId}.${childKey}`);
    }
  }

  return pinnedItems;
};

export { defaultPinnedItems, getPinnedSupplyItems, pinnedItemsSetting };
