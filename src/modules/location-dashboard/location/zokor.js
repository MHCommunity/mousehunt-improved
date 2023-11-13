export default (quests) => {
  if (! quests.QuestAncientCity) {
    return '';
  }

  const quest = {
    district_name: quests?.QuestAncientCity?.district_name || null,
    remaining: quests?.QuestAncientCity?.remaining || null,
  };

  if (! quest.district_name || ! quest.remaining) {
    return '';
  }

  return `${quest.district_name.replace('The ', '')}, ${quest.remaining} stealth`;
};
