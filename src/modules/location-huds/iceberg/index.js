import {
  addHudStyles,
  getCurrentLocation,
  getSetting,
  getUserItems,
  makeElement,
  onRequest,
  onTurn,
  saveSetting
} from '@utils';

import bobIceberg from './styles/bob-iceberg.css';
import styles from './styles/styles.css';

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
      where: '1800-2000 ft',
      length: 200,
      complete: false,
    });
  }

  return sections;
};

const getQuestProgress = () => {
  const depth = user?.quests?.QuestIceberg?.user_progress || 0;

  const charges = user?.quests?.QuestIceberg?.drill_max_charges || 0;
  const heat = user?.quests?.QuestIceberg?.drill_heat || 0;
  const drillsUsed = charges - Math.floor(charges * (heat / 100)) || 0;

  const progressWithoutDrills = depth - (drillsUsed * 20);

  const data = {
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
    data.stage = 300 - depth;
    data.stagePercent = (data.stage / 300) * 100;
  } else if (depth < 600) {
    // If we are less than 600ft, we are in the second stage, so we need to subtract the first stage.
    data.stage = 600 - depth;
    data.stagePercent = (data.stage / 300) * 100;
    data.complete.tunnels = true;
  } else if (depth < 1600) {
    data.stage = 1600 - depth;
    data.stagePercent = (data.stage / 1000) * 100;
    data.complete.tunnels = true;
    data.complete.bulwark = true;
  } else if (depth < 1800) {
    data.stage = 1800 - depth;
    data.stagePercent = data.totalPercent;
    data.complete.tunnels = true;
    data.complete.bulwark = true;
    data.complete.bombing = true;
  } else {
    data.stage = 0;
    data.stagePercent = 0;
    data.isLair = true;
    data.complete.tunnels = true;
    data.complete.bulwark = true;
    data.complete.bombing = true;
    data.complete.depths = true;
  }

  if (user?.quests?.QuestIceberg?.in_bonus) {
    data.stage = 200 - depth;
    data.stagePercent = (depth / 200) * 100;
    data.totalPercent = data.stagePercent;
    data.progress = depth + 1800;
  }

  const turnsTaken = user?.quests?.QuestIceberg?.turns_taken || 0;

  data.avg = progressWithoutDrills / turnsTaken;
  if (Number.isNaN(data.avg)) {
    data.avg = 0;
  }

  if (user?.quests?.QuestIceberg?.in_bonus) {
    data.avg = (progressWithoutDrills + 1800) / turnsTaken;
  }

  data.stagePercent = Math.min(100, 100 - data.stagePercent);
  data.stageHunts = data.avg === 0 ? 0 : Math.ceil(data.stage / data.avg);

  return data;
};

const roundProgress = (progress) => {
  if (Number.isNaN(progress) || progress <= 0) {
    return '0';
  }

  if (progress >= 100) {
    return '100';
  }

  return Number(progress.toFixed(2)).toString();
};

const getTooltipText = (quest) => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('mousehuntTooltip-content');

  const progress = document.createElement('div');
  progress.classList.add('hunts-wrapper');

  const averageHunts = document.createElement('div');
  averageHunts.classList.add('average-hunts');
  averageHunts.innerText = `Avg. ${roundProgress(quest.avg)} ft/hunt`;
  progress.append(averageHunts);

  if (! quest.isLair) {
    const stageProgressPercent = makeElement('div', 'stage-progress-percent');
    makeElement('span', 'progress-label', 'Stage Progress: ', stageProgressPercent);
    makeElement('span', ['progress-label-short', 'hidden'], 'Stage: ', stageProgressPercent);
    makeElement('strong', '', `${roundProgress(quest.stagePercent)}%`, stageProgressPercent);
    progress.append(stageProgressPercent);

    if (! quest.isDeep) {
      const totalProgressPercent = makeElement('div', 'total-progress-percent');
      makeElement('span', 'progress-label', 'Total Progress: ', totalProgressPercent);
      makeElement('span', ['progress-label-short', 'hidden'], 'Total: ', totalProgressPercent);
      makeElement('strong', '', `${roundProgress(quest.totalPercent)}%`, totalProgressPercent);
      progress.append(totalProgressPercent);
    }
  }

  wrapper.append(progress);

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

    section.append(sectionName);

    const sectionLength = document.createElement('div');
    sectionLength.classList.add('iceberg-section-length');
    sectionLength.innerText = sectionData.where;

    section.append(sectionLength);

    sectionsWrapper.append(section);
  });

  wrapper.append(sectionsWrapper);

  return wrapper;
};

const addDeepWarning = async () => {
  const equippedBase = Number.parseInt(user.base_item_id) || 0;

  if (
    equippedBase === 899 || // Deep Freeze Base
    equippedBase === 3256 || // Iceberg Boiler Base
    equippedBase === 2392 // Ultimate Iceberg Base
  ) {
    return;
  }

  const bases = await getUserItems([
    'deep_freeze_base',
    'iceberg_boiler_base',
    'ultimate_iceberg_base',
  ]);

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

  // Create a list of equippable bases, separated by 'or'
  const equippableBasesText = equippableBases
    .map((base, index) => {
      if (index === 0) {
        return base.name;
      }

      if (index === equippableBases.length - 1) {
        return `or ${base.name}`;
      }

      return base.name;
    })
    .join(' ');

  const warning = makeElement('div', 'deep-warning');

  const warningText = makeElement('div', 'deep-warning-text', `To access the Hidden Depths, make sure you equip ${equippableBasesText}.`);

  const warningIcon = makeElement('img', 'deep-warning-icon');
  warningIcon.src = 'https://www.mousehuntgame.com/images/ui/journal/pillage.gif';

  warning.append(warningIcon);
  warning.append(warningText);

  const existingWarning = appendTo.querySelector('.deep-warning');
  if (existingWarning) {
    existingWarning.replaceWith(warning);
  } else {
    appendTo.append(warning);
  }
};

const hud = async () => {
  if ('iceberg' !== getCurrentLocation()) {
    return;
  }

  const huntInfo = document.querySelector('.icebergHud  .depth');
  if (! huntInfo) {
    return;
  }

  const quest = getQuestProgress();

  // If we're in icewing's lair, don't show the stage distance.
  if (! quest.isLair) {
    // Create the stage distance element.
    const remainingStageDistance = document.createElement('div');
    remainingStageDistance.classList.add('remaining-stage-distance');
    const destination = quest.isDeep ? 'Deep' : 'next stage';
    if (quest.stage !== quest.total) {
      const feet = quest.stage.toLocaleString();
      remainingStageDistance.innerHTML = `<strong>${feet}</strong> feet until ${destination}`;
      if (quest.stageHunts > 0) {
        remainingStageDistance.innerHTML += ` (~${quest.stageHunts} hunts)`;
      }
    }

    // Remove the existing stage distance.
    const existingStage = huntInfo.querySelector('.remaining-stage-distance');
    if (existingStage) {
      existingStage.replaceWith(remainingStageDistance);
    } else {
      // Append the stage distance element.
      huntInfo.insertBefore(remainingStageDistance, huntInfo.lastChild);
    }
  }

  // If we're in icewing's lair, don't show the total distance.
  if (! quest.isLair && ! quest.isDeep) {
    // Create the distance element.
    const remainingDistance = document.createElement('div');
    remainingDistance.classList.add('remaining-distance');
    if (quest.total !== 0) {
      const feet = quest.total.toLocaleString();
      remainingDistance.innerHTML = `<strong>${feet}</strong> feet until Icewing's Lair`;
      if (quest.totalHunts > 0) {
        remainingDistance.innerHTML += `(~${quest.totalHunts} hunts)`;
      }
    }

    // Remove the existing distance.
    const existingDistance = huntInfo.querySelector('.remaining-distance');
    if (existingDistance) {
      existingDistance.replaceWith(remainingDistance);
    } else {
      huntInfo.insertBefore(remainingDistance, huntInfo.lastChild);
    }
  }

  huntInfo.classList.add('mousehuntTooltipParent');

  let isStuck = getSetting('location-huds.iceberg-sticky-tooltip', false);
  if (isStuck) {
    huntInfo.classList.add('mh-improved-stick-iceberg-tooltip');
  }

  huntInfo.addEventListener('click', () => {
    isStuck = ! isStuck;
    huntInfo.classList.toggle('mh-improved-stick-iceberg-tooltip');
    saveSetting('location-huds.iceberg-sticky-tooltip', isStuck);
  });

  const tooltip = makeElement('div', 'icebergStatusTooltip');
  tooltip.classList.add('mousehuntTooltip', 'right', 'noEvents');

  const tooltipContent = getTooltipText(quest);

  const existingTooltip = huntInfo.querySelector('.icebergStatusTooltip');
  tooltip.append(tooltipContent);

  makeElement('div', 'mousehuntTooltip-arrow', '', tooltip);

  if (existingTooltip) {
    existingTooltip.replaceWith(tooltip);
  } else {
    huntInfo.append(tooltip);
  }

  if (quest.isLair) {
    addDeepWarning();
  }
};

const makeMapScrollable = () => {
  const map = document.querySelector('.icebergHud .timeline .icebergContainer .iceberg');
  if (! map) {
    return;
  }

  // When the user hovers over the map, allow them to scroll. Scrolling changes the current top of the element.
  // When the user's mouse leaves the map, stop scrolling and reset the top to what it was before.
  map.addEventListener('mouseenter', () => {
    const startingTop = map.style.top.replace('px', '');

    // add a scroll listener to the map
    const scrollListener = (event) => {
      event.preventDefault();

      const scrollAmount = event.deltaY;
      const newTop = Number.parseInt(startingTop, 10) - scrollAmount;
      map.style.top = `${newTop}px`;
    };

    map.addEventListener('wheel', scrollListener);

    map.addEventListener('mouseleave', () => {
      map.style.top = `${startingTop}px`;

      map.removeEventListener('wheel', scrollListener);
    });
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([styles, bobIceberg]);

  hud();

  onTurn(hud, 1000);
  onRequest('environment/iceberg.php', hud);

  makeMapScrollable();
};
