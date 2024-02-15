import { addHudStyles, createPopup, makeElement } from '@utils';

import styles from './styles.css';

import simulate from './simulator';

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
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addUIComponents();
  addSimulatorEvents();
  modifyPlayerIcon();
};
