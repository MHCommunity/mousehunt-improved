export default (quests) => {
  const quest = {
    type: quests.QuestQuesoGeyser.state_name || 'Cork Gathering', // add check for pressure building here
    hunts: quests.QuestQuesoGeyser.hunts_remaining || 0,
  };

  return `${quest.type}, ${quest.hunts} hunts remaining`;
};
