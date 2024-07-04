import { getCurrentPage, onNavigation, onRequest } from '@utils';

/**
 * Add the adventure book class to the adventure book banner.
 */
const addAdventureBookClass = () => {
  if (! user?.quests?.QuestAdventureBook?.adventure?.can_claim) {
    return;
  }

  if (! getCurrentPage('camp')) {
    return;
  }

  const adventureBook = document.querySelector('.adventureBookBanner');
  if (! adventureBook) {
    return;
  }

  adventureBook.classList.add('adventureBookBanner-complete');
};

export default async () => {
  onRequest('*', addAdventureBookClass);
  onNavigation(addAdventureBookClass, {
    page: 'camp',
  });
};
