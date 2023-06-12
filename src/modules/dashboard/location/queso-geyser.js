export default (quests) => {
  if (! quests.QuestQuesoGeyser) {
    return '';
  }

  const quest = {
    state_name: quests?.QuestQuesoGeyser?.state_name || 'Cork Gathering', // add check for pressure building here
    hunts_remaining: quests?.QuestQuesoGeyser?.hunts_remaining || 0,
  };

  return `${quest.state_name}: ${quest.hunts_remaining} hunts remaining`;
};
