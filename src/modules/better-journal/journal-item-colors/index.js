import { addStyles } from '@utils';

import colors from './colors.json';

/**
 * Make the styles for the colors.
 *
 * @return {string} The styles.
 */
const makeStyles = () => {
  let styles = '';

  colors.forEach((color) => {
    styles += `.journal .entry a[href="https://www.mousehuntgame.com/item.php?item_type=${color.item}"] { color: ${color.color}; }`;
  });

  return styles;
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(makeStyles(), 'better-journal-link-colors');
};
