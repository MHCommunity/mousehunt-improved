/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestBountifulBeanstalk) {
    return '';
  }

  if (! quests?.QuestBountifulBeanstalk?.in_castle) {
    const room = quests?.QuestBountifulBeanstalk?.beanstalk?.current_zone?.name || '';
    const huntsRemaining = quests?.QuestBountifulBeanstalk?.beanstalk?.hunts_remaining_text || '';
    const isBoss = quests?.QuestBountifulBeanstalk?.beanstalk?.is_boss_encounter || false;

    return `${room} (Beanstalk) <div class="stats">${isBoss ? 'At Boss · ' : ''}${huntsRemaining}</div>`;
  }

  const huntsRemaining = quests?.QuestBountifulBeanstalk?.castle?.hunts_remaining_text || '';
  const isBoss = quests?.QuestBountifulBeanstalk?.castle?.is_boss_encounter || false;
  const isChase = quests?.QuestBountifulBeanstalk?.castle?.is_boss_chase || false;
  const noise = quests?.QuestBountifulBeanstalk?.castle?.noise_level || 0;
  const maxNoise = quests?.QuestBountifulBeanstalk?.castle?.max_noise_level || 0;

  const roomQuality = quests?.QuestBountifulBeanstalk?.castle?.current_room?.type
    .replace('_room', '')
    .split('_')
    .pop()
    .trim();

  const roomName = quests?.QuestBountifulBeanstalk?.castle?.current_room?.name
    .replace(' Room', '')
    .replace(`${roomQuality.charAt(0).toUpperCase() + roomQuality.slice(1).toLowerCase()} `, '')
    .trim();

  const noiseString = isBoss ? 'Boss' : (isChase ? 'Chase' : `♪ ${noise.toLocaleString()}/${maxNoise.toLocaleString()}`);

  const embellishmentsText = quests?.QuestBountifulBeanstalk?.embellishments
    .filter((item) => item.is_active)
    .map((item) => `<span class="tile ${item.type}"></span>`);

  let returnText = '<div class="dashboard-bb">';
  returnText += `<div class="dashboard-bb-wrap room-name"><span class="tile ${roomQuality}"></span><div class="name">${roomName}</div>`;
  returnText += `<div class="dashboard-bb-wrap embellishments">${embellishmentsText.join('')}</div>`;
  returnText += '</div>';
  returnText += `<div class="stats">${noiseString} · ${huntsRemaining}</div>`;

  return returnText;
};
