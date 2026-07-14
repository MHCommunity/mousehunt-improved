import { addStyles, getSetting } from '@utils';

import colors from '@data/journal-item-colors.json';

import fullMiceImagesNoBorderStyles from './modules/full-mice-images-no-border/styles.css';
import highlightRareMiceStyles from './modules/journal-highlight-rare-mice/styles.css';
import minimalIconStyles from './modules/journal-icons-minimal/styles.css';
import tagStyles from './modules/journal-tags/styles.css';

/**
 * Build journal item color rules from the shipped color data.
 *
 * @return {string} The item color CSS.
 */
const makeItemColorStyles = () => {
  return Object.entries(colors).map(([id, color]) => `#overlayPopup.hunting_summary .lootContainer a[href="https://www.mousehuntgame.com/item.php?item_type=${id}"], .journal .entry a[href="https://www.mousehuntgame.com/item.php?item_type=${id}"] { color: ${color}; }`).join(' ');
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
    {
      enabled: getSetting('better-journal.full-mice-images-no-border', false) &&
        ! getSetting('native-dark-mode', false),
      id: 'full-mice-images-no-border',
      styles: fullMiceImagesNoBorderStyles,
    },
  ];

  styleBundles.forEach((bundle) => {
    if (bundle.enabled) {
      addStyles(bundle.styles, bundle.id);
    }
  });
};
