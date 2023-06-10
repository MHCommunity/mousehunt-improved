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
  const tooltip = makeElement('div', ['mousehuntTooltip', 'tight', direction, ...customClass]);
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

    // console.log(type, completedUpgrades);

    const name = tooltip.querySelector(`.fortRoxHUD-fort-upgrade-boundingBox-level.level_${completedUpgrades}`);
    makeElement('div', 'fortRoxHUD-fort-upgrade-level-info', `(Level ${completedUpgrades}/${upgradeKeys.length})`, name);
  });
};

const main = () => {
  updateNightBar();
  updateUpgradeTooltips();
};

export default main;
