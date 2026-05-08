import { getFieryWarpathPercent, getFieryWarpathRemainingInWave, getFieryWarpathStreak, getFieryWarpathWave } from '@utils/shared/fiery-warpath';
import { getCurrentLocation } from '@utils';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
const getFieryWarpathText = (quests) => {
  if (! quests.QuestFieryWarpath) {
    return '';
  }

  const quest = {
    wave: quests?.QuestFieryWarpath?.wave || 0,
    streak: quests?.QuestFieryWarpath?.streak || 0,
    remaining: quests?.QuestFieryWarpath?.remaining || 0,
    percent: quests?.QuestFieryWarpath?.percent || 100,
  };

  let streakText = '';
  if (quest.streak !== 0) {
    streakText = ` · ${quest.streak} streak`;
  }

  if ('portal' === quest.wave) {
    return `Portal: ${Math.max(0, quest.remaining - 1)} guards remaining `;
  }

  return `Wave ${quest.wave}: ${100 - quest.percent}% remaining${streakText} `;
};

/**
 * Set the Fiery Warpath data.
 *
 * @return {boolean|Object} The Fiery Warpath data.
 */
const setFieryWarpathData = () => {
  if ('desert_warpath' !== getCurrentLocation()) {
    return false;
  }

  const wave = getFieryWarpathWave();

  return {
    wave,
    streak: getFieryWarpathStreak(),
    remaining: getFieryWarpathRemainingInWave(wave),
    percent: getFieryWarpathPercent()
  };
};

export {
  getFieryWarpathText,
  setFieryWarpathData
};
