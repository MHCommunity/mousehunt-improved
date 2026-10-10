import { onTurn } from '@utils';
import { getStage } from '@utils/shared/stages';
import { onLocationAction } from '@utils/shared/stages/location-actions';

let lastStageKey = null;

/**
 * Get a key for the current stage, to tell when it changes.
 *
 * @return {string} The stage key.
 */
const getStageKey = () => {
  const stage = getStage();
  return JSON.stringify([stage.dataEnvironment, stage.data, stage.live]);
};

/**
 * Remember the stage the list was rendered for.
 */
const saveRenderedStage = () => {
  lastStageKey = getStageKey();
};

/**
 * Refresh the list when the mice that can be attracted change: after location actions, and after
 * a hunt that moves to a new stage (a new Sunken City zone, Valour Rift floor, Fort Rox phase, ...).
 *
 * @param {Function} refresh Refreshes the list with fresh effectiveness data.
 */
const addRefreshTriggers = (refresh) => {
  onLocationAction(() => refresh());

  onTurn(() => {
    if (null !== lastStageKey && getStageKey() !== lastStageKey) {
      refresh();
    }
  });
};

export { addRefreshTriggers, saveRenderedStage };
