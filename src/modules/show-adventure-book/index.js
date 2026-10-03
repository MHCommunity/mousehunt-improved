import { addStyles, addSubmenuItem, onModuleToggle, removeSubmenuItem } from '@utils';

import styles from './styles.css';

/**
 * Add the Adventure Book item to the Kingdom menu.
 */
const addMenuItem = () => {
  addSubmenuItem({
    id: 'adventure-book',
    menu: 'kingdom',
    label: 'Adventure Book',
    icon: '/images/teams/sigil/book/_11.png',
    class: 'show_adv_book',
    callback: () => hg.views.AdventureBookView.show(user?.quests?.QuestAdventureBook?.adventure?.type || 'complete_town_of_gnawnia_bounties_adv'),
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'show-adventure-book');

  addMenuItem();

  onModuleToggle('show-adventure-book', {
    enable: addMenuItem,
    disable: () => removeSubmenuItem('adventure-book'),
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'show-adventure-book',
  name: 'Show Adventure Book',
  type: 'navigation-utilities',
  default: false,
  description: 'Add an Adventure Book button to the Kingdom dropdown menu.',
  liveToggle: true,
  load: init,
};
