/**
 * Get the freshest Valour Rift quest data.
 *
 * The game keeps two copies of it: the HUD renders from `user.enviroment_atts`, while
 * `user.quests.QuestRiftValour` is updated separately, and the two can drift apart — one of them
 * can be several hunts behind the other. The tower only ever climbs, so whichever copy has the
 * higher `current_step` is the newer one.
 *
 * The two copies don't hold quite the same fields (augmentations are `active_augmentations` on
 * one and `augmentation_data` on the other), so the older copy is used as the fallback for
 * anything the newer one doesn't carry. Those fields are all run-long settings that don't change
 * mid-climb, so a stale value there is harmless.
 *
 * @return {Object} The quest data, newest values first.
 */
const getQuestData = () => {
  const enviroment = user?.enviroment_atts || {};
  const quest = user?.quests?.QuestRiftValour || {};

  const enviromentStep = Number.parseInt(enviroment.current_step, 10) || 0;
  const questStep = Number.parseInt(quest.current_step, 10) || 0;

  return questStep > enviromentStep ? { ...enviroment, ...quest } : { ...quest, ...enviroment };
};

export default getQuestData;
