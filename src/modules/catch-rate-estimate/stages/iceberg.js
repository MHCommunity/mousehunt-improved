/**
 * Get the Iceberg stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 * @param {string} context.base   The base name.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests, base }) => {
  const liveStages = {
    'Treacherous Tunnels': '0-300ft',
    'Brutal Bulwark': '301-600ft',
    'Bombing Run': '601-1600ft',
    'The Mad Depths': '1601-1800ft',
    "Icewing's Lair": '1800ft',
    'Hidden Depths': '1801-2000ft',
    'The Deep Lair': '2000ft',
    General: 'Generals',
  };

  // MH-Tools splits these phases by base.
  const baseVariantPhases = new Set(['Treacherous Tunnels', 'Bombing Run', 'The Mad Depths']);

  const phase = quests.QuestIceberg.current_phase;

  let data = { General: 'Generals', 'Hidden Depths': 'The Hidden Depths' }[phase] ?? phase;
  if (baseVariantPhases.has(phase) && 'Magnet Base' === base) {
    data += ' (Magnet)';
  } else if ('The Mad Depths' === phase && 'Hearthstone Base' === base) {
    data += ' (Hearthstone)';
  } else if (baseVariantPhases.has(phase) && ['Ultimate Iceberg Base', 'Iceberg Boiler Base'].includes(base)) {
    data += ' (Ultimate Iceberg)';
  }

  return { data, live: liveStages[phase] ?? null };
};
