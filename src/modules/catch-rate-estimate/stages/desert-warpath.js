/**
 * Get the Fiery Warpath stage.
 *
 * @param {Object} context             The stager context.
 * @param {Object} context.viewingAtts The user's viewing attributes.
 *
 * @return {Object} The stage for each source.
 */
export default ({ viewingAtts }) => {
  const wave = viewingAtts.desert_warpath?.wave;
  const stage = 'portal' === wave ? 'Portal' : `Wave ${wave}`;
  return { data: stage, live: stage };
};
