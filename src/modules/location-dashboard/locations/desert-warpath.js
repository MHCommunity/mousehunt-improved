import { getFieryWarpathState } from '@utils/shared/stages/desert-warpath';

/**
 * Dashboard output.
 *
 * @param {Object} quests      The quests data.
 * @param {Object} viewingAtts The location's viewing attributes.
 *
 * @return {string} The dashboard output.
 */
export default (quests, viewingAtts) => {
  if (!viewingAtts.desert_warpath) {
    return '';
  }

  const { wave, isPortal, guardsRemaining, streak, morale } = getFieryWarpathState({ viewingAtts });

  if (isPortal) {
    return `Portal: ${guardsRemaining} guards remaining`;
  }

  return `Wave ${wave}: ${100 - morale}% remaining${streak ? ` · ${streak} streak` : ''}`;
};
