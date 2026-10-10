import { blocks } from './blocks';

const storageKey = 'mh-improved-trap-selector-preview';

/**
 * Get the trap stat summary on the page.
 *
 * @return {HTMLElement|null} The container.
 */
const getContainer = () => document.querySelector('.trapSelectorView__trapStatSummaryContainer');

/**
 * Get a block's element from the trap stat summary on the page.
 *
 * @param {HTMLElement} container The trap stat summary.
 * @param {Object}      block     The block.
 *
 * @return {HTMLElement|null} The element, if it's there and has something in it.
 */
const getBlockElement = (container, block) => {
  const el = container?.querySelector(`:scope > ${block.selector}`);

  // The codex is always on the page, but only shown when one is active.
  if ('codex' === block.id && !el?.classList.contains('trapSelectorView__activeCodexContainer--visible')) {
    return null;
  }

  return el || null;
};

/**
 * Get the saved copy of each block.
 *
 * @return {Object} The blocks' markup, keyed by block id.
 */
const getSnapshot = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
};

/**
 * Save a copy of each block so the editor can show a preview when the trap isn't on the page.
 */
const saveSnapshot = () => {
  const container = getContainer();
  if (!container) {
    return;
  }

  // Blocks come and go while the trap re-renders, so keep the last copy of any that are missing.
  const snapshot = getSnapshot();
  for (const block of blocks) {
    const el = getBlockElement(container, block);
    if (el) {
      snapshot[block.id] = el.outerHTML;
    }
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {}
};

/**
 * Make the preview of a block, from the page if it's there, or else the saved copy.
 *
 * @param {Object} block    The block.
 * @param {Object} snapshot The saved copy of each block.
 *
 * @return {HTMLElement|null} The preview, or null if there's nothing to show.
 */
const makeBlockPreview = (block, snapshot) => {
  const live = getBlockElement(getContainer(), block);
  if (live) {
    return live.cloneNode(true);
  }

  if (!snapshot[block.id]) {
    return null;
  }

  const template = document.createElement('template');
  template.innerHTML = snapshot[block.id];

  return template.content.firstElementChild;
};

export { getContainer, makeBlockPreview, saveSnapshot, getSnapshot };
