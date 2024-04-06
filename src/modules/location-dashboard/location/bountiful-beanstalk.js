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

  if (quests?.QuestBountifulBeanstalk?.in_castle) {
    // Castle text
    const room = quests?.QuestBountifulBeanstalk?.castle?.current_room?.name || '';
    const floor = quests?.QuestBountifulBeanstalk?.castle?.current_floor?.name || false;
    const huntsRemaining = quests?.QuestBountifulBeanstalk?.castle?.hunts_remaining_text || '';
    const isBoss = quests?.QuestBountifulBeanstalk?.castle?.is_boss_encounter || false;
    const isChase = quests?.QuestBountifulBeanstalk?.castle?.is_boss_chase || false;
    const noise = quests?.QuestBountifulBeanstalk?.castle?.noise_level || 0;
    const noiseFormatted = noise.toLocaleString();
    const maxNoise = quests?.QuestBountifulBeanstalk?.castle?.max_noise_level || 0;
    const maxNoiseFormatted = maxNoise.toLocaleString();
    const embellishments = quests?.QuestBountifulBeanstalk?.embellishments.map((item) => {
      return item.is_active ? item.name : null;
    }).filter((item) => item !== null);

    const noiseString = isBoss ? 'Boss' : (isChase ? 'Chase' : `Noise: ${noiseFormatted}/${maxNoiseFormatted}`);
    const floorText = floor ? `(${floor.replace(/ Floor$/, '')})` : '';

    return `${room} ${floorText}<div class="stats">${noiseString} · ${huntsRemaining}</div><div class="embelishments">${embellishments.join(', ')}</div>`;
  }

  const room = quests?.QuestBountifulBeanstalk?.beanstalk?.current_zone?.name || '';
  const huntsRemaining = quests?.QuestBountifulBeanstalk?.beanstalk?.hunts_remaining_text || '';
  const isBoss = quests?.QuestBountifulBeanstalk?.beanstalk?.is_boss_encounter || false;

  return `${room} (Beanstalk) <div class="stats">${isBoss ? 'At Boss' : ''} · ${huntsRemaining}</div>`;
};
