/**
 * Get the storm level. The game's storm level can be wrong near the thresholds, so MH-Tools
 * works it out from the rain and wind when using Dragonvine Cheese.
 *
 * @param {Object} elements The elements.
 * @param {string} bait     The bait name.
 *
 * @return {string} The storm level.
 */
const getStormLevel = (elements, bait) => {
  if ('Dragonvine Cheese' !== bait) {
    return elements.storm.level;
  }

  const percent = Math.min(elements.rain.percent, elements.wind.percent);
  if (100 === percent) {
    return 'max';
  }

  if (percent >= 80) {
    return 'high';
  }

  return percent >= 35 ? 'medium' : 'low';
};

/**
 * Get the Moussu Picchu stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 * @param {string} context.bait   The bait name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests, bait }) => {
  const { elements } = quests.QuestMoussuPicchu;
  const stormLevel = getStormLevel(elements, bait);

  let data = '-';
  if ('none' !== stormLevel) {
    data = `Storm ${stormLevel}`;
  } else if ('up' === elements.rain.direction) {
    data = `Rain ${elements.rain.level}`;
  } else if ('up' === elements.wind.direction) {
    data = `Wind ${elements.wind.level}`;
  }

  // MHCT stages by rain and wind together, which comes back as a row for each.
  return { data, live: [`Rain ${elements.rain.level}`, `Wind ${elements.wind.level}`] };
};
