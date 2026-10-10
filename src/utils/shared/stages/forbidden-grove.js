/**
 * Get the Forbidden Grove stage.
 *
 * @param {Object} context             The stager context.
 * @param {Object} context.quests      The user's quests.
 * @param {Object} context.viewingAtts The user's viewing attributes.
 * @param {string} context.charm       The charm name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests, viewingAtts, charm }) => {
  const stage = (viewingAtts.grove_open ?? quests.QuestForbiddenGrove?.grove?.is_open) ? 'Open' : 'Closed';

  // MHCT tracks the Realm Ripper Charm as its own stage, MH-Tools as a charm.
  return { data: stage, live: 'Realm Ripper Charm' === charm ? charm : stage };
};
