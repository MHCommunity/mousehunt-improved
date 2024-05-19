import {
  addHudStyles,
  createPopup,
  makeElement,
  onRequest,
  onTurn
} from '@utils';
import folkloreForest from '../shared/folklore-forest';
import keepInventoryToggled from '../shared/folklore-forest/keep-inventory-open';
import simulate from './simulator';

import regionStyles from '../shared/folklore-forest/styles.css';
import simulatorStyles from './simulator-styles.css';
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
  const currentVolume = user?.quests?.QuestTableOfContents?.current_book?.volume || 0;
  let text = `<div class="mh-toc-sim-results">
  <div class="stats">
    <div class="group current">
      <div class="result">
        <div class="label">Current Volume</div>
        <div class="value">${currentVolume}</div>
      </div>
      <div class="result">
        <div class="label">Current Words</div>
        <div class="value">${user?.quests?.QuestTableOfContents?.current_book?.word_count?.toLocaleString()}</div>
      </div>
    </div>
    <div class="group mean">
      <div class="result">
        <div class="label">Average Volume</div>
        <div class="value">${results?.mean?.volume}</div>
      </div>
      <div class="result">
        <div class="label">Average Words</div>
        <div class="value">${results?.mean?.words?.toLocaleString()}</div>
      </div>
    </div>
    <div class="group gnawbels">
      <div class="result">
        <div class="label">Average Gnawbels</div>
        <div class="value">${results?.mean?.gnawbels?.toLocaleString()}</div>
      </div>
    </div>
  </div>

  <div class="percents">
    <ol>
      <li class="header">
        <span class="number">Chance</span>
        <span class="percent">Volume</span>
        <span class="words">Words</span>
        <span class="gnabels">Gnawbels</span>
      </li>`;

  for (const chance of results?.chances || []) {
    const chancePercent = Math.floor(chance.chance * 1000) / 10;

    if (chancePercent < 1) {
      continue;
    }

    if (chance.volume === currentVolume) {
      continue;
    }

    let classname = 'normal';
    switch (true) {
    case chancePercent >= 99:
      classname = 'guaranteed';
      break;
    case chancePercent >= 75:
      classname = 'good';
      break;
    case chancePercent >= 30:
      classname = 'maybe';
      break;
    case chancePercent <= 2:
      classname = 'worst';
      break;
    case chancePercent <= 10:
      classname = 'bad';
      break;
    }

    text += `<li class="result ${classname}">
      <span class="number">${chancePercent}%</span>
      <span class="volume">${chance.volume}</span>
      <span class="words">${chance.words?.toLocaleString()}</span>
      <span class="gnawbels">${chance.gnawbels?.toLocaleString()}</span>
    </li>`;
  }

  // <li class="result guaranteed">
  //   <span class="number">99%</span>
  //   <span class="volume">${results?.beyondUnlucky?.volume}</span>
  //   <span class="words">${results?.beyondUnlucky?.words?.toLocaleString()}</span>
  //   <span class="gnawbels">${results?.beyondUnlucky?.gnawbels?.toLocaleString()}</span>
  // </li>
  // <li class="result good">
  //   <span class="number">75%</span>
  //   <span class="volume">${results?.unlucky?.volume}</span>
  //   <span class="words">${results?.unlucky?.words?.toLocaleString()}</span>
  //   <span class="gnawbels">${results?.unlucky?.gnawbels?.toLocaleString()}</span>
  // </li>
  // <li class="result maybe">
  //   <span class="number">50%</span>
  //   <span class="volume">${results?.median?.volume}</span>
  //   <span class="words">${results?.median?.words?.toLocaleString()}</span>
  //   <span class="gnawbels">${results?.median?.gnawbels?.toLocaleString()}</span>
  // </li>
  // <li class="result bad">
  //   <span class="number">25%</span>
  //   <span class="volume">${results?.lucky?.volume}</span>
  //   <span class="words">${results?.lucky?.words?.toLocaleString()}</span>
  //   <span class="gnawbels">${results?.lucky?.gnawbels?.toLocaleString()}</span>
  // </li>
  // <li class="result worst">
  //   <span class="number">1%</span>
  //   <span class="volume">${results?.beyondLucky?.volume}</span>
  //   <span class="words">${results?.beyondLucky?.words?.toLocaleString()}</span>
  //   <span class="cumulative">${results?.beyondLucky?.gnawbels?.toLocaleString()}</span>
  // </li>

  text += '</ol></div></div>';

  return text;
};

/**
 * Creates simulator options.
 * @return {EncySimOptions} Sim options.
 */
const getOptions = () => {
  return {
    TotalSimulations: 10_000,
    TrapPower: user?.trap_power || 0,
    TrapLuck: user?.trap_luck || 0,
    Upgrades: {
      HasEdgeGilding: user?.quests?.QuestTableOfContents?.has_improved_paper || false,
      HasGoldFoilPrinting: user?.quests?.QuestTableOfContents?.has_gold_foil || false,
      HasSilverQuill: user?.quests?.QuestTableOfContents?.has_silver_quill || false,
      HasGoldenQuill: user?.quests?.QuestTableOfContents?.has_golden_quill || false,
    },
    WritingSession: {
      HuntsRemaining: user?.quests?.QuestTableOfContents?.current_book.hunts_remaining || 0,
      WordsWritten: user?.quests?.QuestTableOfContents?.current_book.word_count || 0,
      FuelEnabled: user?.quests?.QuestTableOfContents?.is_fuel_enabled || false,
    }
  };
};

const triggerSimPopup = () => {
  const data = simulate(getOptions());
  const popup = createPopup({
    title: 'Encyclopedia Simulation',
    content: displayResults(data),
    show: false,
  });

  popup.setAttributes({ className: 'mh-toc-popup jsDialogFixed' });
  popup.show();
};

const doSimulation = (selector) => {
  const simPopup = document.querySelector(selector);
  if (! simPopup) {
    return;
  }

  simPopup.addEventListener('click', triggerSimPopup);
};

const addSimulatorEvents = () => {
  doSimulation('.tableOfContentsProgressView-book-wordCount');
  doSimulation('.tableOfContentsProgressView-book-huntsRemaining');
};

const addSimulatorIcon = () => {
  const bookHud = document.querySelector('.folkloreForestRegionView-environmentHud');
  if (! bookHud) {
    return;
  }

  const existing = document.querySelector('.mh-toc-sim-link');
  if (existing) {
    existing.remove();
  }

  const simLink = makeElement('a', ['mh-toc-sim-link', 'mousehuntTooltipParent'], 'View Encyclopedia Simulation');
  simLink.title = 'Simulate Encyclopedia writing';

  const tooltip = makeElement('div', ['mousehuntTooltip', 'tight', 'bottom', 'noEvents'], 'View Encyclopedia Simulation');
  makeElement('div', 'mousehuntTooltip-arrow', '', tooltip);

  simLink.append(tooltip);

  simLink.addEventListener('click', triggerSimPopup);

  bookHud.append(simLink);
};

/**
 * Updates the word loot quantity in the HUD.
 */
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

/**
 * Updates the words required for the next book in the HUD.
 */
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
  addHudStyles([regionStyles, simulatorStyles, styles]);

  folkloreForest();
  addSimulatorIcon();
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
