import {
  addHudStyles,
  makeElement
} from '../../utils';

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
    powerType: 'Arcane or Shadow'
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

const makeTooltip = (text, direction = 'top', customClass = []) => {
  const existing = document.querySelectorAll('.added-frox-tooltip');
  if (existing.length) {
    existing.forEach((tooltip) => {
      tooltip.remove();
    });
  }

  const tooltip = makeElement('div', ['added-frox-tooltip', 'mousehuntTooltip', 'tight', direction, ...customClass]);
  makeElement('div', 'mousehuntTooltip-content', text, tooltip);
  makeElement('div', 'mousehuntTooltip-arrow', '', tooltip);

  return tooltip;
};

const updateNightBar = () => {
  const bar = document.querySelector('.fortRoxHUD-timeline-phases');
  if (! bar) {
    return false;
  }

  const phaseBars = bar.querySelectorAll('.fortRoxHUD-timeline-phase-marker');
  if (! phaseBars.length) {
    return false;
  }

  phaseBars.forEach((phaseBar) => {
    // get the class that starts with 'stage_'
    const phaseClass = Array.from(phaseBar.classList).find((className) => {
      return className.startsWith('stage_');
    });

    const phaseLength = phaseLengths[phaseClass];
    if (! phaseLength) {
      return;
    }

    const phaseTime = document.createElement('div');
    phaseTime.classList.add('fortRoxHUD-timeline-phase-time');

    const tooltipText = [];
    if (phaseBar.classList.contains('past')) {
      tooltipText.push('Phase complete.');
    } else if (phaseClass !== user?.quests?.QuestFortRox?.current_stage) {
      tooltipText.push(`${phaseLength.hunts} hunts. <div class='tooltip-power'>Use ${phaseLength.powerType} power type.</div>`);
    } else {
      tooltipText.push(`${user?.quests?.QuestFortRox?.hunts_until_next_phase} / ${phaseLength.hunts} hunts remaining. <div class='tooltip-power'>Use ${phaseLength.powerType} power type.</div>`);
    }

    const tooltip = makeTooltip(tooltipText.join(' '), 'bottom', 'fortRoxHUD-timeline-phase-time-tooltip');
    phaseBar.appendChild(tooltip);

    phaseBar.classList.add('mousehuntTooltipParent');
  });
};

const updateUpgradeTooltips = () => {
  const upgradeTooltips = document.querySelectorAll('.fortRoxHUD-fort-upgrade-boundingBox');
  if (! upgradeTooltips.length) {
    return false;
  }

  const upgradeInfo = document.querySelectorAll('.fortRoxHUD-fort-upgrade-level-info');
  if (upgradeInfo.length) {
    upgradeInfo.forEach((info) => {
      info.remove();
    });
  }

  upgradeTooltips.forEach((tooltip) => {
    // get the class that starts with 'level_'
    // const levelClass = Array.from(tooltip.classList).find((className) => {
    //   return className.startsWith('level_');
    // });

    // get the type from the onclick attribute
    const type = tooltip.getAttribute('onclick').replace('app.views.HeadsUpDisplayView.hud.fortRoxShowConfirm(\'upgradeFort\', ', '').replace('); return false;', '').replace(/'/g, '');
    const upgradeProgress = user?.quests?.QuestFortRox?.upgrades[type];

    // cycle through the keys in the upgradeProgress object and count how many have a value of 'complete'
    const upgradeKeys = Object.keys(upgradeProgress);
    const completedUpgrades = upgradeKeys.reduce((count, key) => {
      if (upgradeProgress[key].indexOf('complete') > -1) {
        count++;
      }

      return count;
    }, 0);

    const name = tooltip.querySelector(`.fortRoxHUD-fort-upgrade-boundingBox-level.level_${completedUpgrades}`);
    let upgradeText = `(Level ${completedUpgrades}/${upgradeKeys.length - 1})`;

    if (completedUpgrades === upgradeKeys.length - 1) {
      upgradeText = '(Max Level)';
    }

    const upgrade = makeElement('div', 'fortRoxHUD-fort-upgrade-level-info', upgradeText, name);
    upgrade.classList.add('frox-upgrade-level-info');
  });
};

const updateWallHP = () => {
  const exists = document.querySelector('.mh-frox-wall-hp');
  if (exists) {
    exists.remove();
  }

  const hpBox = document.querySelector('.fortRoxHUD-hp');
  if (! hpBox) {
    return false;
  }

  const wallPercent = user.quests.QuestFortRox.hp_percent.toFixed(0);
  const wrapper = makeElement('div', 'mh-frox-wall-hp');
  makeElement('div', 'mh-frox-wall-hp-text', `${wallPercent}%`, wrapper);

  hpBox.appendChild(wrapper);

  hpBox.classList.remove('frox-wall-very-low', 'frox-wall-low', 'frox-wall-medium', 'frox-wall-high', 'frox-wall-perfect');
  const hp = parseInt(user.quests.QuestFortRox.hp_percent, 10);

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

const addPortalClass = () => {
  const portal = document.querySelector('.fortRoxHUD.dawn .fortRoxHUD-enterLairButton');
  if (! portal) {
    return false;
  }

  portal.classList.remove('frox-no-portal', 'frox-has-portal');
  const hasPortal = parseInt(user?.quests?.QuestFortRox?.items?.fort_rox_lair_key_stat_item?.quantity, 10);

  portal.classList.add(hasPortal ? 'frox-has-portal' : 'frox-no-portal');
};

const hud = () => {
  updateNightBar();
  updateUpgradeTooltips();
  updateWallHP();
  addPortalClass();
};

export default () => {
  addHudStyles(styles);
  hud();
};
