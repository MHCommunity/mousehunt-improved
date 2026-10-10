import { getSetting, saveSetting } from '@utils';

const settingKey = 'custom-trap-selector.layout';

/**
 * The blocks in the trap stat summary, in the order they show by default. Some only show when
 * their module is on, or when there's something to show.
 */
const blocks = [
  { id: 'stats', name: 'Trap stats', selector: '.trapSelectorView__trapStatSummary' },
  { id: 'effectiveness', name: 'Trap effectiveness', selector: '.campPage-trap-statsContainer' },
  { id: 'auras', name: 'Auras', selector: '#mh-improved-aura-view' },
  { id: 'favorite-setups', name: 'Favorite setups', selector: '.mh-improved-favorite-setups-button' },
  { id: 'catch-rates', name: 'Catch rates', selector: '#mh-improved-cre' },
  // The game puts the codex above the stats, so it's moved in with the rest.
  { id: 'codex', name: 'Codex', selector: '.trapSelectorView__activeCodexContainer' },
];

/**
 * Check whether a block was hidden by the settings this replaced: Better Trap Selector's codex
 * position, and turning off Show Auras.
 *
 * @param {string} id The block id.
 *
 * @return {boolean} Whether it was hidden.
 */
const isHiddenByOldSetting = (id) => {
  if ('codex' === id) {
    return 'hidden' === getSetting('better-trap-selector.codex-position-0', 'bottom');
  }

  if ('auras' === id) {
    return false === getSetting('show-auras', true);
  }

  return false;
};

/**
 * Get the saved layout, with any blocks it doesn't know about added at the end.
 *
 * @return {Array} The blocks, in order, each with whether it's hidden.
 */
const getLayout = () => {
  const saved = getSetting(settingKey, []);
  const layout = (Array.isArray(saved) ? saved : [])
    .map((item) => {
      const block = blocks.find((b) => b.id === item.id);
      return block ? { ...block, hidden: Boolean(item.hidden) } : null;
    })
    .filter(Boolean);

  for (const block of blocks) {
    if (!layout.some((item) => item.id === block.id)) {
      layout.push({ ...block, hidden: isHiddenByOldSetting(block.id) });
    }
  }

  return layout;
};

/**
 * Check whether a block is hidden.
 *
 * @param {string} id The block id.
 *
 * @return {boolean} Whether it's hidden.
 */
const isBlockHidden = (id) => Boolean(getLayout().find((block) => block.id === id)?.hidden);

/**
 * Save the layout.
 *
 * @param {Array} layout The blocks, in order, each with whether it's hidden.
 */
const saveLayout = (layout) => {
  saveSetting(
    settingKey,
    layout.map(({ id, hidden }) => ({ id, hidden }))
  );
};

/**
 * Reset the layout to the default.
 */
const resetLayout = () => {
  saveSetting(
    settingKey,
    blocks.map(({ id }) => ({ id, hidden: false }))
  );
};

export { blocks, getLayout, isBlockHidden, resetLayout, saveLayout };
