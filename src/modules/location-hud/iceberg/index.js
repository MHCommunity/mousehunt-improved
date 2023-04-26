import { addUIStyles } from '../../utils';
import styles from './styles.css';

const getSections = (quest) => {
  const sections = [
    {
      name: 'Treacherous Tunnels',
      where: '0-300ft',
      length: 300,
      complete: quest.complete.tunnels,
    },
    {
      name: 'Brutal Bulwark',
      where: '300-600ft',
      length: 300,
      complete: quest.complete.bulwark,
    },
    {
      name: 'Bombing Run',
      where: '600-1600ft',
      length: 1000,
      complete: quest.complete.bombing,
    },
    {
      name: 'The Mad Depths',
      where: '1600-1800ft',
      length: 200,
      complete: quest.complete.depths,
    },
    {
      name: 'Icewing\'s Lair',
      where: '1800 ft',
      length: 0,
      complete: quest.complete.lair,
    },
  ];

  if (quest.isDeep) {
    sections.push({
      name: 'Hidden Depths',
      where: '1800-2100 ft',
      length: 300,
      complete: false,
    });
  }

  return sections;
};

const addProgressToQuestData = (data) => {
  const depth = data.progress;

  const remaining = {
    stage: 0,
    stagePercent: 0,
    total: 1800 - depth,
    totalPercent: (depth / 1800) * 100,
    complete: {
      tunnels: false,
      bulwark: false,
      bombing: false,
      depths: false,
      lair: false,
    },
    isLair: false,
  };

  // 0-300ft Treacherous Tunnels
  // 300-600ft Brutal Bulwark
  // 600-1600ft Bombing Run
  // 1600-1800ft The Mad Depths
  // 1800+ Icewing's Lair

  if (depth < 300) {
    // If we are less than 300ft, we are in the first stage.
    remaining.stage = 300 - depth;
    remaining.stagePercent = (remaining.stage / 300) * 100;
  } else if (depth < 600) {
    // If we are less than 600ft, we are in the second stage, so we need to subtract the first stage.
    remaining.stage = 600 - depth;
    remaining.stagePercent = (remaining.stage / 300) * 100;
    remaining.complete.tunnels = true;
  } else if (depth < 1600) {
    remaining.stage = 1600 - depth;
    remaining.stagePercent = (remaining.stage / 1000) * 100;
    remaining.complete.tunnels = true;
    remaining.complete.bulwark = true;
  } else if (depth < 1800) {
    remaining.stage = 1800 - depth;
    remaining.stagePercent = remaining.totalPercent;
    remaining.complete.tunnels = true;
    remaining.complete.bulwark = true;
    remaining.complete.bombing = true;
  } else {
    remaining.stage = 0;
    remaining.stagePercent = 0;
    remaining.isLair = true;
    remaining.complete.tunnels = true;
    remaining.complete.bulwark = true;
    remaining.complete.bombing = true;
    remaining.complete.depths = true;
  }

  if (data.isDeep) {
    remaining.stage = 200 - depth;
    remaining.stagePercent = (depth / 200) * 100;
    remaining.totalPercent = remaining.stagePercent;
    remaining.progress = depth + 1800;
  }

  remaining.avg = data.progress / data.hunts;
  if (data.isDeep) {
    remaining.avg = (depth + 1800) / data.hunts;
  }

  remaining.stageHunts = Math.ceil(remaining.stage / remaining.avg);

  return Object.assign(data, remaining);
};

const roundProgress = (progress) => {
  if (progress >= 100) {
    return 100;
  }

  if (progress <= 0) {
    return 0;
  }

  const percent = progress.toFixed(2);

  if (percent.slice(-2) === '00') {
    return percent.slice(0, -2);
  }

  if (percent.slice(-1) === '0') {
    return percent.slice(0, -1);
  }

  return percent;
};

const getTooltipText = (quest) => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('mousehuntTooltip-content');

  const progress = document.createElement('div');
  progress.classList.add('hunts-wrapper');

  const averageHunts = document.createElement('div');
  averageHunts.classList.add('average-hunts');
  averageHunts.innerText = `Avg. ${roundProgress(quest.avg)} ft/hunt`;
  progress.appendChild(averageHunts);

  if (! quest.isLair) {
    const stageProgressPercent = document.createElement('div');
    stageProgressPercent.classList.add('stage-progress-percent');
    stageProgressPercent.innerText = `Stage Progress: ${roundProgress(quest.stagePercent)}%`;
    progress.appendChild(stageProgressPercent);

    if (! quest.isDeep) {
      const totalProgressPercent = document.createElement('div');
      totalProgressPercent.classList.add('total-progress-percent');
      totalProgressPercent.innerText = `Total Progress: ${roundProgress(quest.totalPercent)}%`;
      progress.appendChild(totalProgressPercent);
    }
  }

  wrapper.appendChild(progress);

  const sectionsWrapper = document.createElement('div');
  sectionsWrapper.classList.add('iceberg-sections');

  const sections = getSections(quest);

  let currentSection = false;
  sections.forEach((sectionData) => {
    if (quest.isDeep && sectionData.name !== 'Hidden Depths') {
      sectionData.complete = true;
    }

    const section = document.createElement('div');
    section.classList.add('iceberg-section', sectionData.complete ? 'complete' : 'incomplete');
    if (! currentSection && ! sectionData.complete) {
      section.classList.add('current');
      currentSection = true;
    }

    const sectionName = document.createElement('div');
    sectionName.classList.add('iceberg-section-name');
    sectionName.innerText = sectionData.name;

    section.appendChild(sectionName);

    const sectionLength = document.createElement('div');
    sectionLength.classList.add('iceberg-section-length');
    sectionLength.innerText = sectionData.where;

    section.appendChild(sectionLength);

    sectionsWrapper.appendChild(section);
  });

  wrapper.appendChild(sectionsWrapper);

  return wrapper;
};

const addDeepWarning = async () => {
  const equippedBase = parseInt(user.base_item_id) || 0;

  if (
    equippedBase === 899 || // Deep Freeze Base
    equippedBase === 3256 || // Iceberg Boiler Base
    equippedBase === 2392 // Ultimate Iceberg Base
  ) {
    return;
  }

  const bases = await getUserItems(['deep_freeze_base', 'iceberg_boiler_base', 'ultimate_iceberg_base']);

  const equippableBases = [];

  let hasBase = false;
  bases.forEach((base) => {
    if (base.quantity > 0) {
      hasBase = true;
      equippableBases.push({ name: base.name, id: base.item_id });
    }
  });

  if (! hasBase) {
    return;
  }

  const appendTo = document.querySelector('.cutawayClippingMask');
  if (! appendTo) {
    return;
  }

  // Create a list of equippable bases, seperated by 'or'
  const equippableBasesText = equippableBases.map((base, index) => {
    if (index === 0) {
      return base.name;
    }

    if (index === equippableBases.length - 1) {
      return `or ${base.name}`;
    }

    return base.name;
  }).join(' ');

  const warning = document.createElement('div');
  warning.classList.add('deep-warning');

  const warningText = document.createElement('div');
  warningText.classList.add('deep-warning-text');
  warningText.innerText = `To access the Hidden Depths, make sure you equip ${equippableBasesText}.`;

  const warningIcon = document.createElement('img');
  warningIcon.classList.add('deep-warning-icon');
  warningIcon.src = 'https://www.mousehuntgame.com/images/ui/journal/pillage.gif?asset_cache_version=2';

  warning.appendChild(warningIcon);
  warning.appendChild(warningText);

  appendTo.appendChild(warning);
};

const main = async () => {
  if ('iceberg' !== getCurrentLocation()) {
    return;
  }

  let quest = {
    progress: user.quests.QuestIceberg.user_progress || 0,
    hunts: user.quests.QuestIceberg.turns_taken || 0,
    chests: user.quests.QuestIceberg.chests || [],
    isDeep: user.quests.QuestIceberg.in_bonus || false,
  };

  const huntInfo = document.querySelector('.icebergHud  .depth');
  if (! huntInfo) {
    return;
  }

  quest = addProgressToQuestData(quest);

  // Stage distance.
  // Remove the existing stage distance.
  const existingStage = huntInfo.querySelector('.remaining-stage-distance');
  if (existingStage) {
    existingStage.remove();
  }

  // If we're in icewing's lair, don't show the stage distance.
  if (! quest.isLair) {
    // Create the stage distance element.
    const remainingStageDistance = document.createElement('div');
    remainingStageDistance.classList.add('remaining-stage-distance');
    const destination = quest.isDeep ? 'Deep' : 'next stage';
    if (quest.stage !== quest.total) {
      remainingStageDistance.innerText = `${quest.stage} feet until ${destination}`;
      if (quest.stageHunts > 0) {
        remainingStageDistance.innerText += ` (~${quest.stageHunts} hunts)`;
      }
    }

    // Append the stage distance element.
    huntInfo.insertBefore(remainingStageDistance, huntInfo.lastChild);
  }

  // Total distance.
  // Remove the existing distance.
  const existingDistance = huntInfo.querySelector('.remaining-distance');
  if (existingDistance) {
    existingDistance.remove();
  }

  // If we're in icewing's lair, don't show the total distance.
  if (! quest.isLair && ! quest.isDeep) {
    // Create the distance element.
    const remainingDistance = document.createElement('div');
    remainingDistance.classList.add('remaining-distance');
    if (quest.total !== 0) {
      remainingDistance.innerText = `${quest.total} feet until Icewing's Lair`;
      if (quest.totalHunts > 0) {
        remainingDistance.innerText += `(~${quest.totalHunts} hunts)`;
      }
    }

    // Append the distance element.
    huntInfo.insertBefore(remainingDistance, huntInfo.lastChild);
  }

  // Tooltip.
  // Remove the existing tooltip.
  const existingTooltip = huntInfo.querySelector('.icebergStatusTooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  huntInfo.classList.add('mousehuntTooltipParent');

  const tooltip = makeElement('div', 'icebergStatusTooltip');
  tooltip.classList.add('mousehuntTooltip', 'right', 'noEvents');

  const tooltipContent = getTooltipText(quest);
  tooltip.appendChild(tooltipContent);

  makeElement('div', 'mousehuntTooltip-arrow', '', tooltip);

  huntInfo.appendChild(tooltip);

  if (quest.isLair) {
    addDeepWarning();
  }
};

export default () => {
  addUIStyles(styles);

  main();
  onPageChange({ change: main });
  onAjaxRequest(main, 'managers/ajax/turns/activeturn.php');
};

// deep warning potentially?
{ /* <div class="valourRiftHUD-warningContainer  active active"><a href="#" class="valourRiftHUD-baitWarning active" onclick="hg.views.HeadsUpDisplayRiftValourView.showTrapSelector(this); return false;">Only standard String baits and Gauntlet String are effective.</a><a href="#" class="valourRiftHUD-powerTypeWarning active" onclick="hg.views.HeadsUpDisplayRiftValourView.showTrapSelector(this); return false;">Only Rift traps are effective.</a></div> */ }
