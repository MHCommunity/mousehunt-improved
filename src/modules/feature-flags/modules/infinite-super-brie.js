import { addStyles } from '@utils';

const selector = '.mousehuntHeaderView a.superBrie:not(#autoHorn) .quantity';

/**
 * Replace the SUPER|brie+ quantity with an infinity symbol.
 */
const replaceQuantity = () => {
  for (const quantity of document.querySelectorAll(selector)) {
    if ('∞' !== quantity.textContent) {
      quantity.textContent = '∞';
    }
  }
};

export default async () => {
  addStyles(`a.menuItem.superBrie .quantity { font-size: 19px; font-family: "Cambria Math", "STIX Two Math", "Latin Modern Math", math, serif; }`, 'infinite-super-brie');

  replaceQuantity();

  // The game rewrites the quantity whenever the inventory updates, so put it back.
  const header = document.querySelector('.mousehuntHeaderView');
  if (header) {
    new MutationObserver(replaceQuantity).observe(header, { childList: true, subtree: true, characterData: true });
  }
};
