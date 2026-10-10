import { getFloatingIslandsState } from '@utils/shared/stages/floating-islands';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests.QuestFloatingIslands?.hunting_site_atts) {
    return '';
  }

  const { tier, powerType, panels, huntsRemaining, wardensCaught } = getFloatingIslandsState({ quests });

  if ('launch_pad' === tier) {
    return `Launch Pad<div class="stats">${wardensCaught} wardens caught</div>`;
  }

  const tiles = panels
    .map((panel) => {
      const panelType = panel.type.toLowerCase().replaceAll('loot_cache', 'key');
      return `<span class="tile ${panelType} ${panel.is_complete ? 'complete' : 'incomplete'}">${panelType}</span>`;
    })
    .join('');

  const type = { low: 'LAI', high: 'HAI', palace: 'SP' }[tier];
  const stats = 'low' === tier ? `${huntsRemaining} hunts remaining · ${wardensCaught} wardens caught` : `${huntsRemaining} hunts remaining`;

  return `<div class="dashboard-fi-wrap"><div class="dashboard-fi-tiles">${tiles}</div><div class="dashboard-fi-type">${powerType} ${type}</div></div><div class="stats">${stats}</div>`;
};
