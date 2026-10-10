// The piece being hunted after each catch: 8 pawns, then 2 knights, 2 bishops, 2 rooks, the queen and the king.
const pieces = ['Pawns', 'Pawns', 'Pawns', 'Pawns', 'Pawns', 'Pawns', 'Pawns', 'Pawns', 'Knights', 'Knights', 'Bishops', 'Bishops', 'Rooks', 'Rooks', 'Queen', 'King'];

/**
 * Get the chess piece being hunted for a side's progress.
 *
 * @param {number} progress The side's progress (0-16).
 *
 * @return {string} The piece, or 'Chess Master' once the side is done.
 */
const getPiece = (progress) => pieces[progress] ?? 'Chess Master';

/**
 * Get the Zugzwang's Tower state.
 *
 * @param {Object} context             The stager context.
 * @param {Object} context.viewingAtts The user's viewing attributes.
 *
 * @return {Object} The amplifier and each side's progress.
 */
const getZugzwangTowerState = ({ viewingAtts }) => {
  const mystic = Number(viewingAtts.zzt_mage_progress) || 0;
  const tech = Number(viewingAtts.zzt_tech_progress) || 0;

  return {
    amp: Number(viewingAtts.zzt_amplifier) || 0,
    maxAmp: Number(viewingAtts.zzt_max_amplifier) || 0,
    mystic,
    tech,
    mysticPiece: getPiece(mystic),
    techPiece: getPiece(tech),
  };
};

/**
 * Get the Zugzwang's Tower stage.
 *
 * @param {Object} context      The stager context.
 * @param {string} context.bait The bait name.
 *
 * @return {Object} The stage for each source.
 */
export default (context) => {
  const { mystic, tech } = getZugzwangTowerState(context);

  const isDoubleRun = ((16 === mystic || 16 === tech) && 'Checkmate Cheese' !== context.bait) || (16 === mystic && 16 === tech);
  const progress = isDoubleRun ? Math.min(mystic, tech) : Math.max(mystic, tech);
  const piece = getPiece(progress);

  // MHCT doesn't stage the tower.
  if (isDoubleRun && 'Chess Master' === piece) {
    return { data: 'Chess Master - Double Run', live: undefined };
  }

  // MH-Tools calls the pawns stage "Pawn Pincher".
  const dataPiece = 'Pawns' === piece ? 'Pawn Pincher' : piece;

  return { data: `${mystic === progress ? 'Mystic' : 'Technic'} ${dataPiece}${isDoubleRun ? ' - Double Run' : ''}`, live: undefined };
};

export { getZugzwangTowerState };
