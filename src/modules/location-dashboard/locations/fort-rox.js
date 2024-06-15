/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestFortRox) {
    return '';
  }

  // set defaults based on quests.QuestFortRox
  const quest = {
    stage: quests.QuestFortRox.current_stage || 'stage_none',
    hp: quests.QuestFortRox.hp || 0,
    max_hp: quests.QuestFortRox.max_hp || 0,
    is_dawn: quests.QuestFortRox.is_dawn || false,
  };

  let phase = 'Day';

  const phases = {
    stage_none: 'Day',
    stage_one: 'Twilight',
    stage_two: 'Midnight',
    stage_three: 'Pitch',
    stage_four: 'Utter Darkness',
    stage_five: 'First Light',
  };

  if (quests.is_lair) {
    return 'In Lair';
  }

  phase = quest.is_dawn ? 'Dawn' : phases[quest.stage];

  return `${phase}: ${quest.hp}/${quest.max_hp} HP`;
};
