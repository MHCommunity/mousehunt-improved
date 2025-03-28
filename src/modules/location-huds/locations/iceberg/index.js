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

/**
 * Get the sections of the iceberg.
 *
 * @param {Object} quest The quest data.
 *
 * @return {Array} The sections.
 */
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

/**
 * Calculate the remaining distance.
 *
 * @param    {number} depth        The current depth.
 * @param    {number} stageStart   The start of the stage.
 * @param    {number} stageEnd     The end of the stage.
 *
 * @return {Object} The remaining distance.
 * @property {number} stage        The remaining distance.
 * @property {number} stagePercent The percentage of the stage completed.
 */
const calculateRemaining = (depth, stageStart, stageEnd) => {
  const stage = stageEnd - depth;
  const stagePercent = (stage / (stageEnd - stageStart)) * 100;
  return { stage, stagePercent };
};

/**
 * Calculate the completion of the stages.
 *
 * @param {number} depth  The current depth.
 * @param {Array}  stages The stages.
 *
 * @return {Array} The completion of the stages.
 */
const calculateCompletion = (depth, stages) => {
  return stages.map((stageEnd) => depth >= stageEnd);
};

/**
 * Calculate the average distance per hunt.
 *
 * @param {number}  progress The current progress.
 * @param {number}  hunts    The number of hunts.
 * @param {boolean} isDeep   If the hunter is in the Hidden Depths.
 * @param {number}  depth    The current depth.
 *
 * @return {number} The average distance per hunt.
 */
const calculateAverage = (progress, hunts, isDeep, depth) => {
  return isDeep ? (depth + 1800) / hunts : progress / hunts;
};

/**
 * Calculate the number of hunts needed to reach the next stage.
 *
 * @param {number} stage The remaining distance.
 * @param {number} avg   The average distance per hunt.
 *
 * @return {number} The number of hunts needed to reach the next stage.
 */
const calculateStageHunts = (stage, avg) => {
  return Math.ceil(stage / avg);
};

/**
 * Get the quest progress.
 *
 * @return {Object} The quest progress.
 * @property {number}  progress     The current progress.
 * @property {number}  hunts        The number of hunts.
 * @property {Array}   chests       The chests.
 * @property {boolean} isDeep       If the hunter is in the Hidden Depths.
 * @property {number}  stage        The remaining distance.
 * @property {number}  stagePercent The percentage of the stage completed.
 * @property {number}  total        The total distance.
 * @property {number}  totalPercent The percentage of the total distance completed.
 * @property {Object}  complete     The completion of the stages.
 * @property {boolean} isLair       If the hunter is in Icewing's Lair.
 * @property {number}  avg          The average distance per hunt.
 * @property {number}  stageHunts   The number of hunts needed to reach the next stage.
 */
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

/**
 * Round the progress to two decimal places.
 *
 * @param {number} progress The progress.
 *
 * @return {string} The rounded progress.
 */
const roundProgress = (progress) => {
  if (Number.isNaN(progress) || progress <= 0) {
    return '0';
  }

  if (progress >= 100) {
    return '100';
  }

  return Number(progress.toFixed(2)).toString();
};

/**
 * Get the progress display markup.
 *
 * @param {Object} quest The quest data.
 *
 * @return {HTMLElement} The progress display markup.
 */
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

/**
 * Add a warning to equip the right bases.
 */
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

/**
 * Update the HUD.
 */
const hud = async () => {
  if ('iceberg' !== getCurrentLocation()) {
    return;
  }

  if (! user.quests.QuestIceberg) {
    return;
  }

  const huntInfo = document.querySelector('.icebergHud .depth');
  if (! huntInfo) {
    return;
  }

  const quest = getQuestProgress();

  // If we're in icewing's lair, don't show the stage distance.
  if (! quest.isLair) {
    // Create the stage distance element.
    const remainingStageDistance = document.createElement('div');
    remainingStageDistance.classList.add('remaining-stage-distance');
    const destination = quest.isDeep ? 'Hidden Depths' : 'next stage';
    if (quest.stage !== quest.total) {
      let feet = quest.stage.toLocaleString();
      if (quest.isDeep) {
        feet = feet - 100;
      }

      if (! quest.isDeep) {
        remainingStageDistance.innerHTML = `<strong>${feet}</strong> feet until ${destination}`;
        if (quest.stageHunts > 0) {
          remainingStageDistance.innerHTML += ` (~${quest.stageHunts} hunts)`;
        }
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
    const remainingDistance = makeElement('div', 'remaining-distance');

    if (quest.total === 0) {
      remainingDistance.innerHTML = '';
    } else {
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
  } else {
    const existingDistance = huntInfo.querySelector('.remaining-distance');
    if (existingDistance) {
      existingDistance.remove();
    }
  }

  huntInfo.classList.add('mousehuntTooltipParent');

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

/**
 * Allow the user to keep the tooltip always visible.
 */
const makeTooltipSticky = () => {
  const tooltip = document.querySelector('.icebergStatusTooltip');
  if (! tooltip) {
    return;
  }

  const huntInfo = document.querySelector('.icebergHud .depth');
  if (! huntInfo) {
    return;
  }

  let isStuck = getSetting('location-huds.iceberg-sticky-tooltip', false);
  if (isStuck) {
    huntInfo.classList.add('mh-improved-stick-iceberg-tooltip');
  }

  huntInfo.addEventListener('click', () => {
    isStuck = ! isStuck;
    huntInfo.classList.toggle('mh-improved-stick-iceberg-tooltip');
    saveSetting('location-huds.iceberg-sticky-tooltip', isStuck);
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([styles, bobIceberg]);

  hud();
  makeTooltipSticky();

  onTurn(hud, 1000);
  onRequest('environment/iceberg.php', hud);
};
