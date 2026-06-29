import { addHudStyles, makeElement, onRequest, onTurn } from '@utils';

import styles from './styles.css';

const phaseLengths = {
  stage_one: {
    hunts: 35,
    powerType: 'Shadow',
  },
  stage_two: {
    hunts: 25,
    powerType: 'Shadow',
  },
  stage_three: {
    hunts: 10,
    powerType: 'Arcane or Shadow',
  },
  stage_four: {
    hunts: 25,
    powerType: 'Arcane',
  },
  stage_five: {
    hunts: 35,
    powerType: 'Arcane',
  },
};

/**
 * Make a tooltip.
 *
 * @param {string}   text        The text to display.
 * @param {string}   direction   The direction to display the tooltip.
 * @param {string[]} customClass Any custom classes to add.
 *
 * @return {Element} The tooltip element.
 */
const makeTooltip = (text, direction = 'top', customClass = []) => {
  const tooltip = makeElement('div', ['added-frox-tooltip', 'mousehuntTooltip', 'tight', direction, ...customClass]);
  makeElement('div', 'mousehuntTooltip-content', text, tooltip);
  makeElement('div', 'mousehuntTooltip-arrow', '', tooltip);

  return tooltip;
};

/**
 * Update the night bar.
 *
 */
const updateNightBar = () => {
  const bar = document.querySelector('.fortRoxHUD-timeline-phases');
  if (! bar) {
    return;
  }

  const phaseBars = bar.querySelectorAll('.fortRoxHUD-timeline-phase-marker');
  if (! phaseBars.length) {
    return;
  }

  const quest = user?.quests?.QuestFortRox;
  // Total night length and the live hunt counts (all upgrade-adjusted by the game).
  const maxHunts = Number.parseInt(quest?.max_hunts_until_dawn, 10) || 130;
  const huntsUntilNext = Number.parseInt(quest?.hunts_until_next_phase, 10);
  const isNight = quest?.current_phase === 'night';

  phaseBars.forEach((phaseBar) => {
    // get the class that starts with 'stage_'
    const phaseClass = [...phaseBar.classList].find((className) => {
      return className.startsWith('stage_');
    });

    const phaseInfo = phaseLengths[phaseClass];
    if (! phaseInfo) {
      return;
    }

    // The marker width is the phase's share of the night (the game already
    // bakes upgrade changes into it), so derive the length from it; fall back
    // to the default length if the width isn't available.
    const widthPercent = Number.parseFloat(phaseBar.style.width);
    const length = Number.isNaN(widthPercent) ? phaseInfo.hunts : Math.round((widthPercent / 100) * maxHunts);

    const isActive = isNight && phaseClass === quest?.current_stage;
    const isPast = phaseBar.classList.contains('past');

    // Show the hunts remaining on the active phase, the full length otherwise.
    const countText = isActive && ! Number.isNaN(huntsUntilNext)
      ? `${huntsUntilNext} hunts`
      : String(length);

    let timeEl = phaseBar.querySelector('.fortRoxHUD-timeline-phase-time');
    if (! timeEl) {
      timeEl = makeElement('div', 'fortRoxHUD-timeline-phase-time');
      phaseBar.append(timeEl);
    }
    timeEl.textContent = countText;
    timeEl.classList.toggle('active', isActive);

    let tooltipText;
    if (isPast) {
      tooltipText = 'Phase complete.';
    } else if (isActive) {
      tooltipText = `${huntsUntilNext} / ${length} hunts remaining. <div class='tooltip-power'>Use ${phaseInfo.powerType} power type.</div>`;
    } else {
      tooltipText = `${length} hunts. <div class='tooltip-power'>Use ${phaseInfo.powerType} power type.</div>`;
    }

    const oldTooltip = phaseBar.querySelector('.added-frox-tooltip');
    if (oldTooltip) {
      oldTooltip.remove();
    }

    phaseBar.append(makeTooltip(tooltipText, 'bottom', ['fortRoxHUD-timeline-phase-time-tooltip']));
    phaseBar.classList.add('mousehuntTooltipParent');
  });
};

/**
 * Update the upgrade tooltips.
 */
const updateUpgradeTooltips = () => {
  const upgradeTooltips = document.querySelectorAll('.fortRoxHUD-fort-upgrade-boundingBox');
  if (! upgradeTooltips.length) {
    return;
  }

  const upgradeInfo = document.querySelectorAll('.fortRoxHUD-fort-upgrade-level-info');
  if (upgradeInfo.length) {
    upgradeInfo.forEach((info) => {
      info.remove();
    });
  }

  upgradeTooltips.forEach((tooltip) => {
    // get the type from the onclick attribute
    const type = tooltip.getAttribute('onclick').replace('app.views.HeadsUpDisplayView.hud.fortRoxShowConfirm(\'upgradeFort\', ', '').replace('); return false;', '').replaceAll('\'', '');
    const upgradeProgress = user?.quests?.QuestFortRox?.upgrades[type];

    // cycle through the keys in the upgradeProgress object and count how many have a value of 'complete'
    const upgradeKeys = Object.keys(upgradeProgress);
    const completedUpgrades = upgradeKeys.reduce((count, key) => {
      if (upgradeProgress[key].includes('complete')) {
        count++;
      }

      return count;
    }, 0);

    const name = tooltip.querySelector(`.fortRoxHUD-fort-upgrade-boundingBox-level.level_${completedUpgrades}`);
    let upgradeText = `(Level ${completedUpgrades}/${upgradeKeys.length - 1})`;

    if (completedUpgrades === upgradeKeys.length - 1) {
      upgradeText = '(Max Level)';
    }

    const upgrade = makeElement('div', 'fortRoxHUD-fort-upgrade-level-info', upgradeText);
    name.append(upgrade);
    upgrade.classList.add('frox-upgrade-level-info');
  });
};

/**
 * Update the wall HP.
 */
const updateWallHP = () => {
  const exists = document.querySelector('.mh-frox-wall-hp');
  if (exists) {
    exists.remove();
  }

  const hpBox = document.querySelector('.fortRoxHUD-hp');
  if (! hpBox) {
    return;
  }

  const wallHpPercent = user?.quests?.QuestFortRox?.hp_percent;
  if (wallHpPercent === undefined) {
    return;
  }

  const wallPercent = wallHpPercent.toFixed(0);
  const wrapper = makeElement('div', 'mh-frox-wall-hp');
  makeElement('div', 'mh-frox-wall-hp-text', `${wallPercent}%`, wrapper);

  hpBox.append(wrapper);

  hpBox.classList.remove(
    'frox-wall-very-low',
    'frox-wall-low',
    'frox-wall-medium',
    'frox-wall-high',
    'frox-wall-perfect'
  );
  const hp = Number.parseInt(`${wallHpPercent}`, 10);

  if (hp === 100) {
    hpBox.classList.add('frox-wall-perfect');
  } else if (hp >= 75) {
    hpBox.classList.add('frox-wall-high');
  } else if (hp >= 50) {
    hpBox.classList.add('frox-wall-medium');
  } else if (hp >= 25) {
    hpBox.classList.add('frox-wall-low');
  } else {
    hpBox.classList.add('frox-wall-very-low');
  }
};

/**
 * Add a class to the portal button.
 */
const addPortalClass = () => {
  const portal = document.querySelector('.fortRoxHUD.dawn .fortRoxHUD-enterLairButton');
  if (! portal) {
    return;
  }

  portal.classList.remove('frox-no-portal', 'frox-has-portal');
  const hasPortal = Number.parseInt(user?.quests?.QuestFortRox?.items?.fort_rox_lair_key_stat_item?.quantity, 10);

  portal.classList.add(hasPortal ? 'frox-has-portal' : 'frox-no-portal');
};

/**
 * Add the boss HP as a visible number and fix the bar width not actually showing the correct width.
 */
const addBossHp = () => {
  if (user?.quests?.QuestFortRox?.current_phase !== 'lair') {
    return;
  }

  const bossHpBox = document.querySelector('.fortRoxHUD-lairBossProgress');
  if (! bossHpBox) {
    return;
  }

  const bossHp = user?.quests?.QuestFortRox?.lair_width || 100;

  const existing = document.querySelector('.frox-boss-hp');
  if (existing) {
    existing.textContent = `${bossHp}%`;
  } else {
    makeElement('div', 'frox-boss-hp', `${bossHp}%`, bossHpBox);
  }

  const bossHpSpan = bossHpBox.querySelector('span');
  if (bossHpSpan) {
    bossHpSpan.style.width = `${bossHp}%`;
  }
};

/**
 * Make the bait items in the bait container equip/unequip their cheese when
 * clicked, reusing the game's own arm button (which already knows the item
 * type, classification, and whether it's currently equipped).
 */
const addBaitClickHandlers = () => {
  const items = document.querySelectorAll('.fortRoxHUD-baitContainer .fortRoxHUD-item');
  items.forEach((item) => {
    if (item.dataset.mhuiBaitClick) {
      return;
    }
    item.dataset.mhuiBaitClick = 'true';
    item.classList.add('mh-frox-bait-clickable');

    item.addEventListener('click', (event) => {
      // Let the existing buttons/links in the tooltip (Buy, Arm) handle their
      // own clicks.
      if (event.target.closest('a, .mousehuntActionButton')) {
        return;
      }

      const armButton = item.querySelector('.mousehuntArmNowButton');
      if (armButton && hg?.utils?.TrapControl?.toggleItem) {
        hg.utils.TrapControl.toggleItem(armButton);
      }
    });
  });
};

/**
 * Refresh all of the HUD enhancements.
 */
const update = () => {
  updateNightBar();
  updateUpgradeTooltips();
  updateWallHP();
  addPortalClass();
  addBossHp();
  addBaitClickHandlers();
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  update();

  onTurn(update, 250);

  // Re-run after Fort Rox actions (upgrades, repairs, entering night, etc.),
  // giving the game a moment to re-render the HUD first.
  onRequest('environment/fort_rox.php', () => {
    setTimeout(update, 250);
  });
};
