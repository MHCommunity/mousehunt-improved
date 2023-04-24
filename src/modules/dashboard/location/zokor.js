export default (quests) => {
  if (! quests.QuestAncientCity) {
    return '';
  }

  const quest = {
    district_name: quests?.QuestAncientCity?.district_name || null,
    remaining: quests?.QuestAncientCity?.remaining || null,
    remaining: quests?.QuestAncientCity?.remaining || null,
  }

  const name = quest.district_name.replace('The ', '');
  return `${name}, ${quest.remaining} stealth`;
};
