import {
  addHudStyles,
  getFieryWarpathWave,
  getFlag,
  makeElement,
  onRequest,
  onTurn
} from '@utils';

import styles from './styles.css';

let engaged = false;

/**
 * Add the missle mini-game to the HUD.
 */
const addMissiles = () => {
  const container = document.querySelector('.warpathHUD-waveContainer');
  if (! container) {
    return;
  }

  const existing = container.querySelector('.warpathHud-missle-activate');
  if (existing) {
    return;
  }

  const trigger = makeElement('div', ['warpathHud-missle-activate', 'warpathHUD-missile']); /* cspell: disable-line */
  container.append(trigger);

  trigger.addEventListener('click', () => {
    engaged = ! engaged;

    if (engaged) {
      container.classList.add('warpathHUD-engaged');
    } else {
      container.classList.remove('warpathHUD-engaged');
    }
  });

  /**
   * Launch a missile.
   *
   * @param {Event} event The click event.
   */
  const launchMissile = (event) => {
    if (! container.classList.contains('warpathHUD-engaged')) {
      return;
    }

    if (event.target.classList.contains('warpathHUD-missile')) {
      return;
    }

    if (! engaged) {
      return;
    }

    // Get the x coordinate of the mouse click for the element.
    let x = event.clientX ? event.clientX - container.getBoundingClientRect().left : Math.floor(Math.random() * container.getBoundingClientRect().width);

    // Randomize the x coordinate a bit.
    x += Math.floor(Math.random() * 50) - 25;

    hg.views.HeadsUpDisplayDesertWarpathView.spawnMissile(x, 1);

    let missile;
    setTimeout(() => {
      missile = container.querySelectorAll('.warpathHUD-missile[style*="left: ' + x + 'px"]');
      if (! missile || missile.length === 0) {
        return;
      }

      missile.forEach((m) => {
        setTimeout(() => {
          m.classList.add('mh-ui-fade');
        }, 50);

        setTimeout(() => {
          m.classList.add('mh-ui-fade-out');
        }, 100);

        setTimeout(() => {
          m.remove();
        }, 500);
      });
    }, 700);
  };

  container.addEventListener('click', launchMissile);
};

const updateCommandBar = () => {
  const wave = getFieryWarpathWave();
  if (! wave || wave > 3) {
    return;
  }

  const panicMeter = document.querySelector('.warpathHUD-moraleBar.mousehuntTooltipParent');
  if (! panicMeter) {
    return;
  }

  const miceInWave = document.querySelectorAll(`.warpathHUD-wave.wave_${wave} .warpathHUD-wave-mouse`);
  const miceRetreats = { 1: 10, 2: 18, 3: 26 };

  let totalRemaining = 0;

  miceInWave.forEach((mouse) => {
    const mouseType = mouse.getAttribute('data-mouse');
    const mouseCount = mouse.querySelector('.warpathHUD-wave-mouse-population');
    if (! mouseType || ! mouseCount) {
      return;
    }

    const remaining = Number.parseInt(mouseCount.textContent, 10) || 0;

    totalRemaining += remaining;
  });

  const waveRetreat = miceRetreats[wave];
  const remainingAfterRetreat = totalRemaining - waveRetreat;
  const retreatText = remainingAfterRetreat <= 0 ? 'Retreated' : `${remainingAfterRetreat} catch${remainingAfterRetreat > 1 ? 'es' : ''} left`;

  panicMeter.classList.add('warpathHUD-panicMeter-wave-stats');
  const existing = panicMeter.querySelector('.warpathHUD-wave-stats');
  if (existing) {
    existing.textContent = retreatText;
  } else {
    makeElement('div', ['warpathHUD-wave-stats'], retreatText, panicMeter);
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addMissiles();
  onRequest('environment/desert_warpath.php', addMissiles);

  if (! getFlag('location-hud-fiery-warpath-no-command-bar-stats')) {
    updateCommandBar();
    onTurn(updateCommandBar, 250);
  }
};
