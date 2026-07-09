/**
 * Item classifications that shouldn't be linked in prose. Weapons and bases
 * mentioned in extra entries (like the refractor base) are trap setup, not loot.
 */
const skipLinkClassifications = new Set(['weapon', 'base']);

// Specific items that should stay as plain text in journal prose.
const excludedItemTypes = new Set([
  'oculus_stat_item',
]);

/**
 * Whether a journal item mention should stay as plain text instead of a link.
 *
 * @param {Object} item The item data object.
 *
 * @return {boolean} Whether to skip linking this item.
 */
const shouldSkipJournalItemLink = (item) => {
  if (! item) {
    return false;
  }

  return skipLinkClassifications.has(item.classification) || excludedItemTypes.has(item.type);
};

export { excludedItemTypes, shouldSkipJournalItemLink };
