import { addIconToMenu } from '@utils';

/**
 * Add an Adventure Book item to the top menu. It's hidden until it's shown with Custom Menu.
 */
export default () => {
  addIconToMenu({
    id: 'mousehunt-improved-adventure-book',
    title: 'Adventure Book',
    text: 'Adventure Book',
    icon: 'https://www.mousehuntgame.com/images/teams/sigil/book/_11.png',
    position: 'prepend',
    action: (e) => {
      e.preventDefault();
      hg.views.AdventureBookView.show(user?.quests?.QuestAdventureBook?.adventure?.type || 'complete_town_of_gnawnia_bounties_adv');
    },
  });
};
