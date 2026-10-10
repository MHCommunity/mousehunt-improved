import { uppercaseFirstLetter } from '@utils';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  const elements = quests.QuestMoussuPicchu?.elements;
  if (!elements) {
    return '';
  }

  const rain = elements.rain || {};
  const wind = elements.wind || {};
  const storm = elements.storm || {};

  if (rain.percent === 100 && wind.percent === 100) {
    return 'Max Storm · Wind (100%) · Rain (100%)';
  }

  const text = `${uppercaseFirstLetter(wind.level || '')} Wind (${wind.percent || 0}%) · ${uppercaseFirstLetter(rain.level || '')} Rain (${rain.percent || 0}%)`;
  if (!storm.level || 'none' === storm.level) {
    return text;
  }

  return `${text}<div class="stats">${uppercaseFirstLetter(storm.level)} Storm</div>`;
};
