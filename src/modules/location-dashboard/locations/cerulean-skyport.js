/**
 * Dashboard output for Cerulean Skyport.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  const quest = quests?.QuestCeruleanSkyport;
  if (!quest) {
    return '';
  }

  if (quest.is_shipping && quest.current_shipment) {
    const shipment = quest.current_shipment;
    const destination = shipment.location?.name || shipment.name || 'Unknown destination';
    const exportName = shipment.primary_loot_item?.name || 'Unknown export';
    const huntsRemaining = shipment.hunts_remaining || 0;
    const huntLabel = 1 === huntsRemaining ? 'hunt' : 'hunts';
    const destinationIcon = shipment.location?.intel_item?.thumb_transparent;
    const exportIcon = shipment.primary_loot_item?.thumb_transparent;
    const destinationImage = destinationIcon ? `<img class="dashboard-cerulean-skyport-icon" src="${destinationIcon}" alt="" />` : '';
    const exportImage = exportIcon ? `<img class="dashboard-cerulean-skyport-icon dashboard-cerulean-skyport-export-icon" src="${exportIcon}" alt="" />` : '';

    return `<div class="dashboard-cerulean-skyport-title">${destinationImage}${destination}</div><div class="stats">${exportImage}${exportName} · ${huntsRemaining} ${huntLabel} remaining</div>`;
  }

  if (quest.is_intercepting && quest.current_raid) {
    const raid = quest.current_raid;
    const huntsRemaining = raid.hunts_remaining || 0;
    const huntLength = raid.hunt_length || 0;
    const huntLabel = 1 === huntsRemaining ? 'hunt' : 'hunts';
    const raidIcon = raid.cost?.[0]?.thumb_transparent;
    const raidImage = raidIcon ? `<img class="dashboard-cerulean-skyport-icon" src="${raidIcon}" alt="" />` : '';

    return `<div class="dashboard-cerulean-skyport-title">${raidImage}${raid.name || 'Unknown'}</div><div class="stats">${huntsRemaining}/${huntLength} ${huntLabel} remaining</div>`;
  }

  const raidCount = quest.num_raids_available || 0;
  const raidLabel = 1 === raidCount ? 'raid' : 'raids';
  const resourceTypes = ['dirigible_debris_stat_item', 'atmospherium_gas_stat_item', 'unrefined_cloudstone_stat_item', 'aurora_spice_stat_item'];
  const resources = resourceTypes
    .map((type) => {
      const item = quest.items?.[type];
      if (!item?.thumb_transparent) {
        return '';
      }

      return `<span class="dashboard-cerulean-skyport-resource"><img class="dashboard-cerulean-skyport-icon" src="${item.thumb_transparent}" alt="" title="${item.name}: ${item.quantity}" />${item.quantity}</span>`;
    })
    .filter(Boolean)
    .join('<span class="dashboard-cerulean-skyport-arrow">→</span>');

  return `<div class="dashboard-cerulean-skyport-title"><span class="dashboard-cerulean-skyport-resources">${resources}</span></div><div class="stats">${raidCount} ${raidLabel} available</div>`;
};
