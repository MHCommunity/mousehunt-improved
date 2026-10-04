import { addStyles, getFlag, getSetting } from '@utils';

import colors from '@data/journal-item-colors.json';

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
        `.journal .content .entry a[href="https://www.mousehuntgame.com/item.php?item_type=${id}"]`,
      ];

      return `${selectors.join(', ')} { color: ${color}; } ${selectors.map((selector) => `.mh-dark ${selector}`).join(', ')} { color: ${dark || color}; }`;
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
      enabled: getFlag('better-journal-icons-minimal'),
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
