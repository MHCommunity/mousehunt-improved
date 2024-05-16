import { addHudStyles, onRequest, onTurn } from '@utils';
import folkloreForest from '../shared/folklore-forest';
import keepInventoryToggled from '../shared/folklore-forest/keep-inventory-open';

import regionStyles from '../shared/folklore-forest/styles.css';
import styles from './styles.css';

const updateWordLootQuantity = () => {
  const lootSpan = document.querySelector('.tableOfContentsView-wordMeter-value');
  if (! lootSpan) {
    return;
  }

  // if the loot has a dash, then it's a range and we should just show the first value.
  // split it on the dash and if the values are the same, just show one.
  const loot = lootSpan.innerText;
  const lootParts = loot.split('-');
  if (lootParts.length > 1 && lootParts[0] === lootParts[1]) {
    lootSpan.innerText = lootParts[0];
  }
};

const updateNextWordCount = () => {
  const wordsRequired = document.querySelector('.tableOfContentsProgressView-nextBook-wordsRequired');
  if (! wordsRequired) {
    return;
  }

  wordsRequired.innerText = wordsRequired.getAttribute('title').replace(' words', '');
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([regionStyles, styles]);

  folkloreForest();

  updateWordLootQuantity();
  onRequest('environment/table_of_contents.php', updateWordLootQuantity);

  updateNextWordCount();
  onTurn(() => {
    updateNextWordCount();
    setTimeout(updateNextWordCount, 500);
    setTimeout(updateNextWordCount, 1000);
  });

  keepInventoryToggled({
    setting: 'location-huds.table-of-contents-inventory-toggled',
    buttonSelector: '.folkloreForestRegionView-environmentInventory-expandButton',
    inventorySelector: '.folkloreForestRegionView-environmentInventoryContainer',
    inventoryOpenClass: 'expanded',
    buttonOpenClass: 'expanded',
  });
};
