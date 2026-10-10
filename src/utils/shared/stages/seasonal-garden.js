/**
 * Get the Seasonal Garden state.
 *
 * @param {Object} context             The stager context.
 * @param {Object} context.viewingAtts The user's viewing attributes.
 *
 * @return {Object} The season and the amplifier.
 */
const getSeasonalGardenState = ({ viewingAtts }) => {
  return {
    season: { sg: 'Spring', sr: 'Summer', fl: 'Fall', wr: 'Winter' }[viewingAtts.season] ?? null,
    amp: Number(viewingAtts.zzt_amplifier) || 0,
    maxAmp: Number(viewingAtts.zzt_max_amplifier) || 0,
  };
};

/**
 * Get the Seasonal Garden stage.
 *
 * @param {Object} context The stager context.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const { season } = getSeasonalGardenState(context);
  return { data: season, live: season };
};

export { getSeasonalGardenState };
