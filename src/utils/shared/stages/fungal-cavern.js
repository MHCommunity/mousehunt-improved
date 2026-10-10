/**
 * Get the Fungal Cavern stage.
 *
 * @param {Object} context      The stager context.
 * @param {string} context.base The base name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ base }) => {
  const stage = 'Gemology Base' === base ? 'Gemology Base' : 'Not Gemology';
  return { data: stage, live: stage };
};
