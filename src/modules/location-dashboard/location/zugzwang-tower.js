/**
 * Get the chess progress based on the number of pieces.
 *
 * @param {number} pieces The number of chess pieces.
 *
 * @return {string} The chess progress.
 */
const getChessProgress = (pieces) => {
  if (pieces <= 8) {
    return 'Pawns';
  }

  if (pieces <= 10) {
    return 'Knights';
  }

  if (pieces <= 12) {
    return 'Bishops';
  }

  if (pieces <= 14) {
    return 'Rooks';
  }

  if (pieces <= 15) {
    return 'Queen';
  }

  return 'King';
};

/**
 * Get the Zugzwang Tower text.
 *
 * @param {Object} quests The quests object.
 *
 * @return {string} The Zugzwang Tower text.
 */
const getZugzwangTowerText = (quests) => {
  if (! quests.QuestZugzwangTower) {
    return '';
  }

  const returnText = `${quests.QuestZugzwangTower.amp || 0}%`;

  const techProgress = quests.QuestZugzwangTower.tech_progress || 0;
  const mythProgress = quests.QuestZugzwangTower.myth_progress || 0;

  if (techProgress >= 16 && mythProgress >= 16) {
    return `${returnText} Amp, Chessmaster`;
  }

  return `${returnText} Amp, Technic: ${getChessProgress(techProgress)}, Mystic: ${getChessProgress(mythProgress)}`;
};

/**
 * Set the Zugzwang Tower data.
 *
 * @return {Object} The Zugzwang Tower data.
 */
const setZugzwangTowerData = () => {
  const ampEl = document.querySelector('.zuzwangsTowerHUD-currentAmplifier span');
  const amp = ampEl ? Number.parseInt(ampEl.innerText, 10) : 0;

  const techProgressEl = document.querySelectorAll('.zuzwangsTowerHUD-progress.tech img');
  const techProgress = techProgressEl ? techProgressEl.length : 0;

  const mythProgressEl = document.querySelectorAll('.zuzwangsTowerHUD-progress.magic img');
  const mythProgress = mythProgressEl ? mythProgressEl.length : 0;

  return {
    amp,
    techProgress,
    mythProgress,
  };
};

export {
  getZugzwangTowerText,
  setZugzwangTowerData
};
