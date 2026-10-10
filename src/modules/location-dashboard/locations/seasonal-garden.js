import { getSeasonalGardenState } from '@utils/shared/stages/seasonal-garden';

/**
 * Dashboard output.
 *
 * @param {Object} quests      The quests data.
 * @param {Object} viewingAtts The location's viewing attributes.
 *
 * @return {string} The dashboard output.
 */
export default (quests, viewingAtts) => {
  if (undefined === viewingAtts.season) {
    return '';
  }

  const { amp, maxAmp } = getSeasonalGardenState({ viewingAtts });

  return 0 === maxAmp ? `Amp: ${amp}%` : `Amp: ${amp}% / ${maxAmp}%`;
};
