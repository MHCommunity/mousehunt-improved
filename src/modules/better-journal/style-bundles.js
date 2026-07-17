import { addStyles, getSetting } from '@utils';

import colors from '@data/journal-item-colors.json';

import highlightRareMiceStyles from './modules/journal-highlight-rare-mice/styles.css';
import minimalIconStyles from './modules/journal-icons-minimal/styles.css';
import tagStyles from './modules/journal-tags/styles.css';

/**
 * Build journal item color rules from the shipped color data.
 *
 * @return {string} The item color CSS.
 */
const makeItemColorStyles = () => {
  return Object.entries(colors)
    .map(([id, value]) => {
      const { color, dark } = 'string' === typeof value ? { color: value } : value;
      const selectors = [
        `#overlayPopup.hunting_summary .lootContainer a[href="https://www.mousehuntgame.com/item.php?item_type=${id}"]`,
        `.journal .entry a[href="https://www.mousehuntgame.com/item.php?item_type=${id}"]`,
      ];

      let styles = `${selectors.join(', ')} { color: ${color}; }`;
      if (dark) {
        styles += ` ${selectors.map((selector) => `.mh-dark ${selector}`).join(', ')} { color: ${dark}; }`;
      }

      return styles;
    })
    .join(' ');
};

/**
 * Load the enabled CSS-only journal features.
 */
export default () => {
  const styleBundles = [
    {
      enabled: getSetting('better-journal.item-colors', true),
      id: 'better-journal-link-colors',
      styles: makeItemColorStyles(),
    },
    {
      enabled: getSetting('better-journal.journal-tags', false),
      id: 'better-journal-tags',
      styles: tagStyles,
    },
    {
      enabled: getSetting('better-journal.highlight-rare-mice', false),
      id: 'better-journal-highlight-rare-mice',
      styles: highlightRareMiceStyles,
    },
    {
      enabled: getSetting('better-journal.icons-minimal', false),
      id: 'better-journal-icons-minimal',
      styles: minimalIconStyles,
    },
  ];

  styleBundles.forEach((bundle) => {
    if (bundle.enabled) {
      addStyles(bundle.styles, bundle.id);
    }
  });
};
