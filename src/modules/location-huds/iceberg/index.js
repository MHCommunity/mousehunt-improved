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

const calculateRemaining = (depth, stageStart, stageEnd) => {
  const stage = stageEnd - depth;
  const stagePercent = (stage / (stageEnd - stageStart)) * 100;
  return { stage, stagePercent };
};

const calculateCompletion = (depth, stages) => {
  return stages.map((stageEnd) => depth >= stageEnd);
};

const calculateAverage = (progress, hunts, isDeep, depth) => {
  return isDeep ? (depth + 1800) / hunts : progress / hunts;
};

const calculateStageHunts = (stage, avg) => {
  return Math.ceil(stage / avg);
};

const getQuestProgress = () => {
  const quest = user?.quests?.QuestIceberg;
  if (! quest) {
    return false;
  }

  const data = {
    progress: quest.user_progress || 0,
    hunts: quest.turns_taken || 0,
    chests: quest.chests || [],
    isDeep: quest.in_bonus || false,
  };

  const depth = data.progress;
  const stages = [300, 600, 1600, 1800];
  const stageIndex = stages.findIndex((stageEnd) => depth < stageEnd);
  const { stage, stagePercent } = calculateRemaining(depth, stages[stageIndex - 1] || 0, stages[stageIndex]);
  const complete = calculateCompletion(depth, stages);
  const avg = calculateAverage(data.progress, data.hunts, data.isDeep, depth);
  const stageHunts = calculateStageHunts(stage, avg);

  const remaining = {
    stage,
    stagePercent: 100 - stagePercent,
    total: 1800 - depth,
    totalPercent: (depth / 1800) * 100,
    complete: {
      tunnels: complete[0],
      bulwark: complete[1],
      bombing: complete[2],
      depths: complete[3],
      lair: depth >= 1800,
    },
    isLair: depth >= 1800,
    avg,
    stageHunts,
  };

  return { ...data, ...remaining };
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
  const wrapper = makeElement('div', 'mousehuntTooltip-content');
  const progress = makeElement('div', 'hunts-wrapper');

  makeElement('div', 'average-hunts', `Avg. ${roundProgress(quest.avg)} ft/hunt`, progress);

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

  const sectionsWrapper = makeElement('div', 'iceberg-sections');

  const sections = getSections(quest);

  let currentSection = false;
  sections.forEach((sectionData) => {
    if (quest.isDeep && sectionData.name !== 'Hidden Depths') {
      sectionData.complete = true;
    }

    const section = makeElement('div', ['iceberg-section', sectionData.complete ? 'complete' : 'incomplete']);
    if (! currentSection && ! sectionData.complete) {
      section.classList.add('current');
      currentSection = true;
    }

    makeElement('div', 'iceberg-section-name', sectionData.name, section);
    makeElement('div', 'iceberg-section-length', sectionData.where, section);

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

  if (! user.quests.QuestIceberg) {
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
