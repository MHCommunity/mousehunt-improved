/**
 * Dashboard output for Afterword Acres.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestAfterwordAcres) {
    return '';
  }

  const quest = quests.QuestAfterwordAcres;

  const multipler = quest.blight_thresholds?.find((threshold) => threshold.tier === quest.blight_tier)?.multiplier;

  return `Blight: ${quest?.blight_level_nice_number || '0'} / ${quest?.max_blight_level || '0'} (x${multipler})`;
};
