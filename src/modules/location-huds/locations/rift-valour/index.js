import {
  addHudStyles,
  createPopup,
  getSetting,
  makeElement,
  onTrapChange
} from '@utils';

import flippedAvatarStyles from './flipped-avatar.css';
import styles from './styles.css';

import simulate from './simulator';

/**
 * Display the results of the simulation.
 *
 * @param {Object} results The results.
 *
 * @return {string} The results as HTML.
 */
const displayResults = (results) => {
  let eclipseText = '';
  results.eclipses.forEach((eclipse) => {
    eclipseText += `<li>
    <span class="number">Eclipse ${eclipse.number}</span>
    <span class="percent ${eclipse.percent === '100.0' ? 'guaranteed' : ''}">${eclipse.percent}%</span>
    <span class="cumulative ${eclipse.cumulative === '100.0' ? 'guaranteed' : ''}">${eclipse.cumulative}%</span>
    </li>`;
  });

  return `<div class="mh-vrift-sim-results">
    <div class="stats">
      <div class="result">
        <div class="label">Speed</div>
        <div class="value">${results.speed}</div>
      </div>
      <div class="result">
        <div class="label">Sync</div>
        <div class="value">${results.sync}</div>
      </div>
      <div class="result">
        <div class="label">Avg. Highest Floor</div>
        <div class="value">${results.avgFloor}</div>
      </div>
      <div class="result">
        <div class="label">Avg. Hunts</div>
        <div class="value">${results.avgHunts}</div>
      </div>
      <div class="result">
        <div class="label">Sigils (Loot)</div>
        <div class="value">${results.lootSigils}</div>
      </div>
      <div class="result">
        <div class="label">Secrets (Loot)</div>
        <div class="value">${results.lootSecrets}</div>
      </div>
      <div class="result">
        <div class="label">Sigils (Cache)</div>
        <div class="value">${results.cacheSigils}</div>
      </div>
      <div class="result">
        <div class="label">Secrets (Cache)</div>
        <div class="value">${results.cacheSecrets}</div>
      </div>
    </div>

    <div class="eclipses">
      <ol>
        <li class="header">
          <span class="number">#</span>
          <span class="percent">Chance</span>
          <span class="cumulative">Total</span>
        </li>
        ${eclipseText}
      </ol>
    </div>
  </div>`;
};

/**
 * Run the simulation when the user clicks on the target.
 *
 * @param {string} selector The selector to listen for clicks on.
 */
const doSimulation = (selector) => {
  const simPopup = document.querySelector(selector);
  if (! simPopup) {
    return;
  }

  simPopup.addEventListener('click', () => {
    const data = simulate(false);
    const popup = createPopup({
      title: 'Valour Rift Run Simulation',
      content: displayResults(data),
      show: false,
    });

    popup.setAttributes({ className: 'mh-vrift-popup' });
    popup.show();
  });
};

/**
 * Add the UI changes.
 */
const addUIComponents = () => {
  const existing = document.querySelector('#mh-vrift-floor-name');
  if (existing) {
    existing.remove();
  }

  const floor = document.querySelector('.valourRiftHUD-currentFloor');
  if (floor) {
    const floorName = makeElement('div', 'valourRiftHUD-floorName', user?.quests?.QuestRiftValour?.floor_name);
    floorName.id = 'mh-vrift-floor-name';
    floor.append(floorName);
  }

  const floorTooltipParent = document.querySelector('.valourRiftHUD-floorProgress.mousehuntTooltipParent');
  if (! floorTooltipParent) {
    return;
  }

  const tooltip = floorTooltipParent.querySelector('.mousehuntTooltip');
  if (! tooltip) {
    return;
  }

  tooltip.classList.add('bottom', 'mh-vrift-floor-tooltip');
  tooltip.classList.remove('top');

  const stepsRemaining = tooltip.querySelector('.valourRiftHUD-stepsRemaining');
  if (! stepsRemaining) {
    return;
  }

  const floorBar = document.querySelector('.valourRiftHUD-floorProgress-barContainer');
  if (! floorBar) {
    return;
  }

  const stepsExisting = document.querySelector('.mh-vrift-steps-remaining');
  if (stepsExisting) {
    stepsExisting.remove();
  }

  makeElement('div', 'mh-vrift-steps-remaining', stepsRemaining.textContent, floorBar);
};

/**
 * Modify the player icon so that it spins when clicked.
 */
const modifyPlayerIcon = () => {
  const playerIcon = document.querySelector('.valourRiftHUD-tower-sprite.player .valourRiftHUD-tower-sprite-image');
  if (! playerIcon) {
    return;
  }

  let timeout;
  playerIcon.addEventListener('click', (event) => {
    // If they're holding shift, then instead of spinning, change the size
    if (event.shiftKey) {
      playerIcon.classList.toggle('mh-improved-player-large');
      return;
    }

    playerIcon.classList.add('mh-improved-player-spin');

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      playerIcon.classList.remove('mh-improved-player-spin');
    }, 700);
  });
};

/**
 * Add the simulator click events.
 */
const addSimulatorEvents = () => {
  doSimulation('.valourRiftHUD-floorProgress-barContainer');

  const magnifyingGlass = document.querySelector('.valourRiftHUD-previewTower');
  if (! magnifyingGlass) {
    return;
  }

  const existing = document.querySelector('.mh-vrift-sim-link');
  if (existing) {
    existing.remove();
  }

  const simLink = makeElement('a', ['valourRiftHUD-previewTower', 'mh-vrift-sim-link'], 'Simulate Run');
  simLink.title = 'Simulate Valour Rift Run';
  // append next to the magnifying glass
  magnifyingGlass.after(simLink);

  doSimulation('.mh-vrift-sim-link');
};

/**
 * Remove the warning if an Ultimate Charm is equipped.
 */
const removeWarningIfUcEquipped = () => {
  const warningContainer = document.querySelector('.valourRiftHUD-warningContainer.active');
  if (! warningContainer) {
    return;
  }

  warningContainer.classList.remove('hidden');

  const powerTypeWarning = warningContainer.querySelector('.valourRiftHUD-powerTypeWarning.active');
  if (! powerTypeWarning) {
    return;
  }

  powerTypeWarning.classList.remove('hidden');

  if (1075 == user.trinket_item_id) { // eslint-disable-line eqeqeq
    warningContainer.classList.add('hidden');
    powerTypeWarning.classList.add('hidden');
  }
};

/**
 * Highlight quantities if an Ultimate Charm is equipped.
 */
const highlightQuantitiesIfUcEquipped = async () => {
  const selectors = [
    '.valourRiftHUD-gauntletBait-quantity.quantity',
    '.valourRiftHUD-towerLoot-quantity.quantity',
    '.valourRiftHUD-powerUp-currentLevel',
  ];

  selectors.forEach((selector) => {
    const existing = document.querySelectorAll(selector);
    if (! existing) {
      return;
    }

    existing.forEach((e) => {
      if (1075 == user.trinket_item_id) { // eslint-disable-line eqeqeq
        e.classList.add('uc-text-highlight');
      } else {
        e.classList.remove('uc-text-highlight');
      }
    });
  });
};

/**
 * Actions to take if an Ultimate Charm is equipped.
 */
const ifUcEquipped = () => {
  removeWarningIfUcEquipped();
  highlightQuantitiesIfUcEquipped();
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([
    styles,
    getSetting('location-huds.valour-rift-flip-avatar', false) ? flippedAvatarStyles : '',
  ]);

  addUIComponents();
  addSimulatorEvents();
  modifyPlayerIcon();

  onTrapChange(ifUcEquipped);
};
