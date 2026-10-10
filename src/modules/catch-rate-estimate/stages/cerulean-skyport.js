/**
 * Get the Cerulean Skyport stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const shipments = {
    gas_shipment: 'Atmo',
    cloudstone_shipment: 'Mining',
    spice_shipment: 'Spice',
  };

  const quest = quests.QuestCeruleanSkyport;
  let stage = 'Docked';
  if (quest.is_intercepting) {
    stage = `Intercepting - ${quest.current_raid.name}`;
  } else if (quest.is_shipping) {
    stage = `Shipping - ${shipments[quest.current_shipment.type]}`;
  }

  return { data: stage, live: stage };
};
