import { uppercaseFirstLetter } from '@utils';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! (quests.QuestMoussuPicchu && quests.QuestMoussuPicchu.elements)) {
    return '';
  }

  const quest = {
    rainPercent: quests?.QuestMoussuPicchu?.elements?.rain?.percent || 0,
    rainLevel: quests?.QuestMoussuPicchu?.elements?.rain?.level || null,
    stormPercent: quests?.QuestMoussuPicchu?.elements?.storm?.percent || 0,
    stormLevel: quests?.QuestMoussuPicchu?.elements?.storm?.level || null,
    windPercent: quests?.QuestMoussuPicchu?.elements?.wind?.percent || 0,
    windLevel: quests?.QuestMoussuPicchu?.elements?.wind?.level || null,
  };

  if ('none' !== quest.stormLevel) {
    return `${uppercaseFirstLetter(quest.stormLevel)} Storm`;
  }

  return `${uppercaseFirstLetter(quest.windLevel)} Wind (${quest.windPercent}%), ${uppercaseFirstLetter(quest.rainLevel)} Rain (${quest.rainPercent}%)`;
};
