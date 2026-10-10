import { formatNumber } from '@utils';
import { getBountifulBeanstalkState } from '@utils/shared/stages/bountiful-beanstalk';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests.QuestBountifulBeanstalk) {
    return '';
  }

  const state = getBountifulBeanstalkState({ quests });

  if (!state.inCastle) {
    return `${state.zone} (Beanstalk) <div class="stats">${state.isBoss ? 'At Boss · ' : ''}${state.huntsRemainingText}</div>`;
  }

  let noiseText = `♪ ${formatNumber(state.noise)}/${formatNumber(state.maxNoise)}`;
  if (state.isBoss) {
    noiseText = 'Boss';
  } else if (state.isChase) {
    noiseText = 'Chase';
  }

  const embellishments = state.embellishments.map((type) => `<span class="tile ${type}"></span>`).join('');

  let returnText = '<div class="dashboard-bb">';
  returnText += `<div class="dashboard-bb-wrap room-name"><span class="tile ${state.roomQuality}"></span><div class="name">${state.room}</div>`;
  returnText += `<div class="dashboard-bb-wrap embellishments">${embellishments}</div>`;
  returnText += '</div>';
  returnText += `<div class="stats">${noiseText} · ${state.huntsRemainingText}</div>`;

  return returnText;
};
