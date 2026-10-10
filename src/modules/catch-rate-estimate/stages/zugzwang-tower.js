/**
 * Get the chess piece for a tower's progress.
 *
 * @param {number} progress The progress.
 *
 * @return {string} The piece.
 */
const getPiece = (progress) => {
  if (progress < 8) {
    return 'Pawn Pincher';
  }

  const pieces = { 8: 'Knights', 9: 'Knights', 10: 'Bishops', 11: 'Bishops', 12: 'Rooks', 13: 'Rooks', 14: 'Queen', 15: 'King' };
  return pieces[progress] ?? 'Chess Master';
};

/**
 * Get the Zugzwang's Tower stage.
 *
 * @param {Object} context             The stager context.
 * @param {Object} context.viewingAtts The user's viewing attributes.
 * @param {string} context.bait        The bait name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ viewingAtts, bait }) => {
  const mystic = Number(viewingAtts.zzt_mage_progress);
  const tech = Number(viewingAtts.zzt_tech_progress);

  const isDoubleRun = ((16 === mystic || 16 === tech) && 'Checkmate Cheese' !== bait) || (16 === mystic && 16 === tech);
  const progress = isDoubleRun ? Math.min(mystic, tech) : Math.max(mystic, tech);
  const piece = getPiece(progress);

  // MHCT doesn't stage the tower.
  if (isDoubleRun && 'Chess Master' === piece) {
    return { data: 'Chess Master - Double Run', live: undefined };
  }

  return { data: `${mystic === progress ? 'Mystic' : 'Technic'} ${piece}${isDoubleRun ? ' - Double Run' : ''}`, live: undefined };
};
