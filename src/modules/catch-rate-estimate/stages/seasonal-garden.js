/**
 * Get the Seasonal Garden stage.
 *
 * @param {Object} context             The stager context.
 * @param {Object} context.viewingAtts The user's viewing attributes.
 *
 * @return {Object} The stage for each source.
 */
export default ({ viewingAtts }) => {
  const stage = { sg: 'Spring', sr: 'Summer', fl: 'Fall', wr: 'Winter' }[viewingAtts.season] ?? null;
  return { data: stage, live: stage };
};
