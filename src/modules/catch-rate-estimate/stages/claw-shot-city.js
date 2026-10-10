/**
 * Get the Claw Shot City stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const { map_active: mapActive, has_wanted_poster: hasPoster } = quests.QuestClawShotCity;

  // MH-Tools has a Ringleaders stage, but doesn't say when it applies.
  let data = null;
  if (!mapActive) {
    data = 'No Wanted Poster Open';
  } else if (!hasPoster) {
    data = 'Crew';
  }

  let live = 'Using poster';
  if (!mapActive) {
    live = hasPoster ? 'Has poster' : 'No poster';
  }

  return { data, live };
};
