export default (quests) => {
  if (! quests.QuestMousoleum) {
    return '';
  }

  const quest = {
    has_wall: quests.QuestMousoleum.has_wall || false,
    wall_health: quests.QuestMousoleum.wall_health || 0,
    max_wall_health: quests.QuestMousoleum.max_wall_health || 0,
    planks: quests.QuestMousoleum.wall_materials || 0,
  };

  if (quest.has_wall) {
    return `Has Wall - ${quest.wall_health}/${quest.max_wall_health} HP`;
  }

  return `No Wall, ${quest.planks} planks`;
};
