export default (quests) => {
  if (! quests.QuestFloatingIslands || ! quests.QuestFloatingIslands.hunting_site_atts) {
    return '';
  }

  const powerTypes = {
    arcn: 'Arcane',
    frgttn: 'Forgotten',
    hdr: 'Hydro',
    shdw: 'Shadow',
    drcnc: 'Draconic',
    law: 'Law',
    phscl: 'Physical',
    tctcl: 'Tactical',
    launch_pad_island: 'Launch Pad',
  };

  const quest = {
    activated_island_mod_types: quests?.QuestFloatingIslands?.hunting_site_atts?.activated_island_mod_types || null,
    island_mod_panels: quests?.QuestFloatingIslands?.hunting_site_atts?.island_mod_panels || null,
    island_power_type: quests?.QuestFloatingIslands?.hunting_site_atts?.island_power_type || null,
    isHai: quests?.QuestFloatingIslands?.hunting_site_atts?.is_high_altitude || false,
    isSp: quests?.QuestFloatingIslands?.hunting_site_atts?.is_vault_island || false,
    isLai: false,
    hunts_remaining: quests?.QuestFloatingIslands?.hunting_site_atts?.hunts_remaining || null,
    wardens_caught: quests?.QuestFloatingIslands?.hunting_site_atts?.sky_wardens_caught || 0,
  };

  quest.isLai = ! quest.isHai && ! quest.isSp;

  const isLaunchPad = quest.island_power_type === 'launch_pad_island';
  if (isLaunchPad) {
    return `Launch Pad, ${quest.wardens_caught} wardens caught`;
  }

  let type = 'LAI';
  if (quest.isHai) {
    type = 'HAI';
  } else if (quest.isSp) {
    type = 'SP';
  }

  let tileText = '';
  quest.island_mod_panels.forEach((panel) => {
    const panelType = panel.type.toLowerCase()
      .replaceAll('loot_cache', 'key')
      .replaceAll('charm_bonus', 'J');
    // todo: add in other tiles here.

    const complete = panel.is_complete ? 'complete' : 'incomplete';

    tileText += `<span class="tile ${panelType} ${complete}">${panelType}</span>`;
  });

  const powerType = powerTypes[quest.island_power_type];

  let returnText = `${powerType} ${type} <span class='dashboard-fi-tiles'>${tileText}</span> ${quest.hunts_remaining} hunts left`;
  if (quest.isLai) {
    returnText += ` (${quest.wardens_caught} wardens caught)`;
  }

  return returnText;
};
