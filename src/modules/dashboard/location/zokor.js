export default (quests) => {
  if (! quests.QuestAncientCity) {
    return '';
  }

  const quest = {
    district_name: quests?.QuestAncientCity?.district_name || null,
    remaining: quests?.QuestAncientCity?.remaining || null,
  };

  return `${quest.district_name.replace('The ', '')}, ${quest.remaining} stealth`;
};
