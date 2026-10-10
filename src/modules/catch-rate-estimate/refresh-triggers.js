import { onRequest, onTurn } from '@utils';
import { getStage } from '@utils/shared/stages';

let lastStageKey = null;

/**
 * Get a key for a stage, to tell when it changes.
 *
 * @param {Object} [source] The user to get the stage for. Defaults to the global user.
 *
 * @return {string} The stage key.
 */
const getStageKey = (source) => {
  const stage = getStage(source);
  return JSON.stringify([stage.dataEnvironment, stage.data, stage.live]);
};

/**
 * Remember the stage the list was rendered for.
 */
const saveRenderedStage = () => {
  lastStageKey = getStageKey();
};

/**
 * Refresh the list when the mice that can be attracted change: after a location action or a hunt
 * that moves to a new stage (a new Sunken City zone, Valour Rift floor, Fort Rox phase, ...).
 *
 * @param {Function} refresh Refreshes the list with fresh effectiveness data.
 */
const addRefreshTriggers = (refresh) => {
  const refreshIfStageChanged = (response) => {
    // The game may not have updated the global user from the response yet.
    const source = response?.user ? { ...user, ...response.user } : user;
    if (null !== lastStageKey && getStageKey(source) !== lastStageKey) {
      refresh();
    }
  };

  onRequest('environment/', refreshIfStageChanged);
  onTurn(refreshIfStageChanged);
};

export { addRefreshTriggers, saveRenderedStage };
