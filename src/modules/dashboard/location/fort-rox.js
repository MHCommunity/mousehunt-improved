export default (quests) => {
  if (! quests.QuestFortRox) {
    return '';
  }

  // set defaults based on quests.QuestFortRox
  const quest = {
    stage: quests.QuestFortRox.current_stage || 'stage_none',
    hp: quests.QuestFortRox.hp || 0,
    max_hp: quests.QuestFortRox.max_hp || 0,
  };

  const phases = {
    stage_none: 'Unknown',
    stage_one: 'Twilight',
    stage_two: 'Midnight',
    stage_three: 'Pitch',
    stage_four: 'Utter Darkness',
    stage_five: 'First Light'
  };

  return `${phases[quest.stage]} - ${quest.hp}/${quest.max_hp} HP`;
};
