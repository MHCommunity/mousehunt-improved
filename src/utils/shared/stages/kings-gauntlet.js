/**
 * Get the King's Gauntlet stage.
 *
 * @return {Object} The stage for each source.
 */
export default () => {
  // MH-Tools splits the gauntlet by tier, which isn't detected yet. MHCT doesn't stage it.
  return { data: null, live: undefined };
};
