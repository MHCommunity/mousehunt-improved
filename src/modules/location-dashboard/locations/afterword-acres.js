import { getAfterwordAcresState } from '@utils/shared/stages/afterword-acres';

/**
 * Dashboard output for Afterword Acres.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests.QuestAfterwordAcres) {
    return '';
  }

  const { multiplier, blight, maxBlight } = getAfterwordAcresState({ quests });

  return `Blight: ${blight} / ${maxBlight}${multiplier ? ` (${multiplier})` : ''}`;
};
