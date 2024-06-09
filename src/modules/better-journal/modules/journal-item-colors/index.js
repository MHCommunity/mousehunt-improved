import { addStyles } from '@utils';

import colors from '@data/journal-item-colors.json';

/**
 * Make the styles for the colors.
 *
 * @return {string} The styles.
 */
const makeStyles = () => {
  return Object.entries(colors).map(([id, icon]) => `#overlayPopup.hunting_summary .lootContainer a[href="https://www.mousehuntgame.com/item.php?item_type=${id}"], .journal .entry a[href="https://www.mousehuntgame.com/item.php?item_type=${id}"] { color: ${icon}; }`).join(' ');
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(makeStyles(), 'better-journal-link-colors');
};
