/**
 * Get the Muridae Market stage.
 *
 * @param {Object} context       The stager context.
 * @param {string} context.charm The charm name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ charm }) => {
  // MH-Tools tracks the Artisan Charm as a charm, MHCT as a stage.
  return { data: '-', live: 'Artisan Charm' === charm ? 'Artisan' : 'Not Artisan' };
};
