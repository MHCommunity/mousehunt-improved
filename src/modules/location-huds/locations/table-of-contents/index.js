import {
  addHudStyles,
  createPopup,
  makeElement,
  onDialogShow,
  onRequest,
  onTurn
} from '@utils';
import folkloreForest from '../../shared/folklore-forest';
import keepInventoryToggled from '../../shared/folklore-forest/keep-inventory-open';
import simulate from './simulator';

import regionStyles from '../../shared/folklore-forest/styles.css';
import simulatorStyles from './simulator-styles.css';
import styles from './styles.css';

/**
 * @typedef {import('./simulator').EncySimOptions} EncySimOptions
 * @typedef {import('./simulator').EncySimResults} EncySimResults
 */

/**
 * Formats the results.
 * @param {EncySimResults} results   The sim results.
 * @param {number}         timeTaken The time taken.
 *
 * @return {string} Results as HTML.
 */
const displayResults = (results, timeTaken) => {
  const options = getOptions();
  const currentVolume = user?.quests?.QuestTableOfContents?.current_book?.volume || 0;
  const currentWordCount = user?.quests?.QuestTableOfContents?.current_book?.word_count || 0;

  const expectedVolume = results?.mostLikely?.volume < currentVolume ? currentVolume : results?.mostLikely?.volume;
  const expectedWords = results?.mostLikely?.words < currentWordCount ? currentWordCount : results?.mostLikely?.words;

  let text = `<div class="mh-toc-sim-results ${options.WritingSession.M1KMode ? 'm1k' : ''}">
  <div class="stats">
    <div class="group current">
      <div class="result">
        <div class="label">Current Volume</div>
        <div class="value">${currentVolume}</div>
      </div>
      <div class="result">
        <div class="label">Current Words</div>
        <div class="value">${currentWordCount?.toLocaleString()}</div>
      </div>
    </div>
    <div class="group mean">
      <div class="result">
        <div class="label">Expected Volume</div>
        <div class="value">${expectedVolume.toLocaleString()}</div>
      </div>
      <div class="result">
        <div class="label">Expected Words</div>
        <div class="value">${expectedWords?.toLocaleString()}</div>
      </div>
    </div>
    <div class="group items">
      <div class="result">
        <div class="label">Expected Gnawbels</div>
        <div class="value">${results?.mostLikely?.gnawbels?.toLocaleString()}</div>
      </div>
      <div class="result processors">
        <div class="result">
          <div class="label">Expected Processors</div>
          <div class="value">${results?.mostLikely?.processors?.toLocaleString()}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="percents">
    <ol>
      <li class="header">
        <span class="percent">Volume</span>
        <span class="number">Chance</span>
        <span class="words">Words Remaining</span>
        <span class="gnawbels">Gnawbels</span>
        <span class="processors">Processors</span>
      </li>`;

  for (const chance of results?.chances || []) {
    if (chance.cumulativeChance >= 0.999) {
      chance.cumulativeChance = 1;
    }

    const chancePercent = Math.floor(chance.cumulativeChance * 1000) / 10;

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

    if (chance.volume === expectedVolume) {
      classname += ' expected';
    }

    let wordsToGo = chance.words - currentWordCount;
    if (wordsToGo < 0) {
      wordsToGo = 0;
    }

    text += `<li class="result ${classname}" id="mh-toc-sim-volume-${chance.volume}">
      <span class="volume">${chance.volume}</span>
      <span class="number">${chancePercent.toFixed(1)}%</span>
      <span class="words">${wordsToGo?.toLocaleString()}</span>
      <span class="gnawbels">${chance.gnawbels?.toLocaleString()}</span>
      <span class="processors">${chance.processors?.toLocaleString()}</span>
    </li>`;
  }

  const bait = `${options.WritingSession.M1KMode ? 'Thousandth' : 'Final'} Draft Derby`;
  text += '</ol></div></div>';
  text += `<div class="info">Simulated ${options.TotalSimulations.toLocaleString()} writing sessions with ${bait} equipped in ${(timeTaken / 1000).toFixed(3)}s.</div>`;

  return {
    text,
    expectedVolume,
  };
};

/**
 * Creates simulator options.
 *
 * @return {EncySimOptions} Sim options.
 */
const getOptions = () => {
  return {
    TotalSimulations: 100_000,
    TrapPower: user?.trap_power || 0,
    TrapLuck: user?.trap_luck || 0,
    TrapCharmId: user?.trinket_item_id || 0,
    Upgrades: {
      HasEdgeGilding: user?.quests?.QuestTableOfContents?.has_improved_paper || false,
      HasGoldFoilPrinting: user?.quests?.QuestTableOfContents?.has_gold_foil || false,
      HasSilverQuill: user?.quests?.QuestTableOfContents?.has_silver_quill || false,
      HasGoldenQuill: user?.quests?.QuestTableOfContents?.has_golden_quill || false,
      HasRainbowQuill: user?.quests?.QuestTableOfContents?.has_rainbow_quill || false,
    },
    WritingSession: {
      HuntsRemaining: user?.quests?.QuestTableOfContents?.current_book.hunts_remaining || 0,
      WordsWritten: user?.quests?.QuestTableOfContents?.current_book.word_count || 0,
      FuelEnabled: user?.quests?.QuestTableOfContents?.is_fuel_enabled || false,
      M1KMode: user?.bait_name === 'Thousandth Draft Derby Cheese' || false,
    }
  };
};

/**
 * Get the data and display the sim popup.
 */
const triggerSimPopup = () => {
  const startTimestamp = Date.now();
  const data = simulate(getOptions());
  const endTimestamp = Date.now();

  const timeTaken = endTimestamp - startTimestamp;

  const { text, expectedVolume } = displayResults(data, timeTaken);
  const popup = createPopup({
    title: 'Encyclopedia Simulation',
    content: text,
    show: false,
  });

  popup.setAttributes({ className: 'mh-toc-popup' });
  popup.show();

  const expectedVolumeElement = document.querySelector(`#mh-toc-sim-volume-${expectedVolume}`);
  if (expectedVolumeElement) {
    expectedVolumeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/**
 * Helper to attach the sim to click events.
 *
 * @param {string} selector The selector to attach to.
 */
const doSimulation = (selector) => {
  const simPopup = document.querySelector(selector);
  if (! simPopup) {
    return;
  }

  simPopup.addEventListener('click', triggerSimPopup);
};

/**
 * Attach the simulator events to the HUD.
 */
const addSimulatorEvents = () => {
  doSimulation('.tableOfContentsProgressView-book-wordCount');
  doSimulation('.tableOfContentsProgressView-book-huntsRemaining');
};

/**
 * Adds the simulator icon to the HUD.
 */
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

const splitLine = (line) => {
  const parts = line.split(':');
  if (parts.length > 1) {
    const header = `${parts.shift().trim()}:`;
    const content = parts.join(':').trim();
    return { header, content };
  }
  return { header: '', content: line };
};

const updateClaimDialog = () => {
  const stats = document.querySelector('.tableOfContentsClaimDialogView-bestStats');
  if (stats && ! stats.querySelector('.mh-best-stats-wrapper')) {
    const text = stats.innerHTML.replaceAll(/<br\s*\/?>/gi, '\n');
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const longestLine = lines.find((l) => /longest book/i.test(l)) || lines[0] || '';
    const numWordsLine = lines.find((l) => /num words/i.test(l)) || lines[1] || '';

    const longestParts = splitLine(longestLine);
    const numWordsParts = splitLine(numWordsLine);

    // Replace content with two divs (header + content).
    const wrapper = makeElement('div', 'tableOfContentsClaimDialogView-bestStats');

    const longestDiv = makeElement('div', 'mh-best-stats-wrapper');
    const longestHeader = makeElement('div', 'mh-best-stats-header', longestParts.header);
    const longestContent = makeElement('div', 'mh-best-stats-content', longestParts.content);
    longestDiv.append(longestHeader, longestContent);

    const numWordsDiv = makeElement('div', 'mh-best-stats-wrapper');
    const numWordsHeader = makeElement('div', 'mh-best-stats-header', numWordsParts.header);
    const numWordsContent = makeElement('div', 'mh-best-stats-content', numWordsParts.content);
    numWordsDiv.append(numWordsHeader, numWordsContent);

    wrapper.append(longestDiv, numWordsDiv);
    stats.replaceWith(wrapper);
  }

  const bookStats = document.querySelector('.tableOfContentsClaimDialogView-bookStats');
  if (bookStats && ! bookStats.querySelector('.mh-book-stats-wrapper')) {
    const text = bookStats.innerHTML.replaceAll(/<br\s*\/?>/gi, '\n');
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const bookWrapper = makeElement('div', 'tableOfContentsClaimDialogView-bookStats');

    for (const line of lines) {
      const parts = splitLine(line);
      const row = makeElement('div', 'mh-book-stats-wrapper');
      const header = makeElement('div', 'mh-book-stats-header', parts.header);
      const content = makeElement('div', 'mh-book-stats-content', parts.content);
      row.append(header, content);
      bookWrapper.append(row);
    }

    bookStats.replaceWith(bookWrapper);
  }
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
  onDialogShow('tableOfContentsClaimDialogPopup', updateClaimDialog);

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
