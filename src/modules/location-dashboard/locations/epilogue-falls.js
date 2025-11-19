/**
 * Dashboard output for Epilogue Falls.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestEpilogueFalls) {
    return '';
  }

  const quest = quests.QuestEpilogueFalls;

  if (! quest.on_rapids) {
    return 'Building Barrel';
  }

  const rapids = quest.rapids;

  const barrelName = rapids.barrel?.name || 'Unknown Barrel';
  const barrelHealth = rapids.barrel?.health || 0;
  const barrelMaxHealth = rapids.barrel?.max_health || 0;
  const barrelPercent = rapids.barrel?.health_percentage || 0;
  const barrelText = `${barrelName}: ${barrelHealth}/${barrelMaxHealth} (${barrelPercent}%)`;

  if (rapids.in_grotto) {
    return `Hidden Grotto<div class="stats">${barrelText}</div>`;
  }

  const speed = rapids.barrel_speed || 0;
  const movement = rapids.movement_per_catch || 0;
  const directionText = rapids.movement_direction === 'forward'
    ? `Speed: ${speed}m/s · Movement: +${movement}m →`
    : `Speed: ${speed}m/s · Movement: -${movement.toString().replace('-', '')}m ←`;

  return `${rapids.zone_data?.name || ''} (${rapids?.position || 0}m)
  <div class="stats">${barrelText}</div>
  <div class="stats">${directionText}</div>`;
};
