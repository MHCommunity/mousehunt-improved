import { addHudStyles, createPopup, onRequest, onTurn } from '@utils';
import folkloreForest from '../shared/folklore-forest';
import keepInventoryToggled from '../shared/folklore-forest/keep-inventory-open';
import simulate from './simulator';

import regionStyles from '../shared/folklore-forest/styles.css';
import styles from './styles.css';

/**
 * @typedef {import('./simulator').EncySimOptions} EncySimOptions
 * @typedef {import('./simulator').EncySimResults} EncySimResults
 */

/**
 * Formats the results.
 * @param {EncySimResults} results The sim results.
 * @return {string} Results as HTML.
 */
const displayResults = (results) => {
  return `
  <div class="mh-toc-sim-results">
    <div class="header">
      <div class="cell"></div>
      <div class="cell">Volumes</div>
      <div class="cell">Gnawbels</div>
    </div>
    <div class="rowGroup">
      <div class="row">
        <div class="cell">Mean</div>
        <div class="cell">${results.mean.volume}</div>
        <div class="cell">${results.mean.gnawbels}</div>
      </div>
    </div>
    <div class="rowGroup">
      <div class="row">
        <div class="cell">75% Chance of Reaching</div>
        <div class="cell">${results.unlucky.volume}</div>
        <div class="cell">${results.unlucky.gnawbels}</div>
      </div>
    </div>
    <div class="rowGroup">
      <div class="row">
        <div class="cell">Median</div>
        <div class="cell">${results.median.volume}</div>
        <div class="cell">${results.median.gnawbels}</div>
      </div>
    </div>
    <div class="rowGroup">
      <div class="row">
        <div class="cell">25% Chance of Reaching</div>
        <div class="cell">${results.lucky.volume}</div>
        <div class="cell">${results.lucky.gnawbels}</div>
      </div>
    </div>
  </div>`;
};

/**
 * Creates simulator options.
 * @return {EncySimOptions} Sim options.
 */
const getOptions = () => {
  return {
    TotalSimulations: 10_000,
    TrapPower: user.trap_power,
    TrapLuck: user.trap_luck,
    Upgrades: {
      HasEdgeGilding: user.quests.QuestTableOfContents.has_improved_paper,
      HasGoldFoilPrinting: user.quests.QuestTableOfContents.has_gold_foil,
      HasSilverQuill: user.quests.QuestTableOfContents.has_silver_quill,
      HasGoldenQuill: user.quests.QuestTableOfContents.has_golden_quill,
    },
    WritingSession: {
      HuntsRemaining: user.quests.QuestTableOfContents.current_book.hunts_remaining,
      WordsWritten: user.quests.QuestTableOfContents.current_book.word_count,
      FuelEnabled: user.quests.QuestTableOfContents.is_fuel_enabled,
    }
  };
};

const doSimulation = (selector) => {
  const simPopup = document.querySelector(selector);
  if (! simPopup) {
    return;
  }

  simPopup.addEventListener('click', () => {
    const data = simulate(getOptions());
    const popup = createPopup({
      title: 'Encyclopedia Simulation',
      content: displayResults(data),
      show: false,
    });

    popup.setAttributes({ className: 'mh-toc-popup' });
    popup.show();
  });
};

const addSimulatorEvents = () => {
  doSimulation('.tableOfContentsProgressView-book-wordCount');
  doSimulation('.tableOfContentsProgressView-book-huntsRemaining');
};

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
  addSimulatorEvents();

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
