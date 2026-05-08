import {
  addHudStyles,
  getFlag,
  makeElement,
  onRequest,
  onTrapChange,
  onTurn,
  showHornMessage
} from '@utils';
import { getFieryWarpathWave } from '@utils/shared/fiery-warpath';

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
        setTimeout(() => m.classList.remove('mh-ui-fade-in'), 50);
        setTimeout(() => m.classList.remove('mh-ui-fade-out'), 50);
        setTimeout(() => m.remove(), 500);
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

const powerTypesToTrinkets = {
  physical: [
    534, // Warpath Archer Charm
    538, // Warpath Scout Charm
    539, // Warpath Warrior Charm
    540, // Super Warpath Archer Charm
    543, // Super Warpath Scout Charm
    544, // Super Warpath Warrior Charm
  ],
  tactical: [
    535, // Warpath Cavalry Charm
    541, // Super Warpath Cavalry Charm
  ],
  hydro: [
    537, // Warpath Mage Charm
    542, // Super Warpath Mage Charm
  ],
  draconic: [
    1835, // Gargantua Charm
  ],
};

let reminder;
const addPowerTypeReminders = () => {
  const currentPowerType = user?.trap_power_type_name.toLowerCase() || '';
  const currentTrinket = user?.trinket_item_id || 0;

  if (! currentPowerType || ! currentTrinket) {
    return;
  }

  let needsReminder = false;
  let powerTypeToRemind = '';
  Object.keys(powerTypesToTrinkets).forEach((powerType) => {
    if (powerTypesToTrinkets[powerType].includes(currentTrinket) && currentPowerType !== powerType) {
      needsReminder = true;
      powerTypeToRemind = powerType;
    }
  });

  // Close any existing reminder.
  if (reminder) {
    const reminderClose = reminder.querySelector('.huntersHornMessageView__countdown');
    if (reminderClose) {
      reminderClose.click();
    }
  }

  if (needsReminder) {
    reminder = showHornMessage({
      title: 'Power Type Reminder',
      text: `The power type for these mice is ${powerTypeToRemind.charAt(0).toUpperCase() + powerTypeToRemind.slice(1)}.`,
      image: `https://www.mousehuntgame.com/images/powertypes/${powerTypeToRemind}.png`,
      type: 'error',
      button: 'Switch',
      action: () => {
        const trapSelector = document.querySelector('.campPage-trap-armedItem.weapon');
        if (trapSelector) {
          trapSelector.click();
        }
      },
      dismiss: 6000,
    });

    needsReminder = false;
    powerTypeToRemind = '';
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addMissiles();
  onRequest('environment/desert_warpath.php', addMissiles);

  onTrapChange(addPowerTypeReminders);

  if (! getFlag('location-hud-fiery-warpath-no-command-bar-stats')) {
    updateCommandBar();
    onTurn(updateCommandBar, 250);
  }
};
