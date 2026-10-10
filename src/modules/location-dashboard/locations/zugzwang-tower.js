import { getZugzwangTowerState } from '@utils/shared/stages/zugzwang-tower';

/**
 * Dashboard output.
 *
 * @param {Object} quests      The quests data.
 * @param {Object} viewingAtts The location's viewing attributes.
 *
 * @return {string} The dashboard output.
 */
export default (quests, viewingAtts) => {
  if (undefined === viewingAtts.zzt_tech_progress) {
    return '';
  }

  const { amp, mysticPiece, techPiece } = getZugzwangTowerState({ viewingAtts });

  if ('Chess Master' === mysticPiece && 'Chess Master' === techPiece) {
    return `Amp: ${amp}%<div class="stats">Chess Master</div>`;
  }

  return `Amp: ${amp}%<div class="stats">Technic: ${techPiece} · Mystic: ${mysticPiece}</div>`;
};
