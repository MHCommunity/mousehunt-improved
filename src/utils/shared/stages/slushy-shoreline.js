/**
 * Get the Slushy Shoreline stage.
 *
 * @param {Object} context       The stager context.
 * @param {string} context.charm The charm name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ charm }) => {
  // MH-Tools tracks the Softserve Charm as a charm, MHCT as a stage.
  return { data: '-', live: 'Softserve Charm' === charm ? 'Softserve' : 'Not Softserve' };
};
