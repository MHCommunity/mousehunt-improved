export default (quests) => {
  if (! quests.QuestAncientCity.district_name || ! quests.QuestAncientCity.remaining) {
    return false;
  }

  const quest = {
    name: quests.QuestAncientCity.district_name.replace('The ', '') || '',
    stealth: quests.QuestAncientCity.remaining || 0,
  };
  return `${quest.name}, ${quest.stealth} stealth`;
};
