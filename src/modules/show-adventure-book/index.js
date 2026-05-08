import { addStyles, addSubmenuItem } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'show-adventure-book');

  addSubmenuItem({
    id: 'adventure-book',
    menu: 'kingdom',
    label: 'Adventure Book',
    icon: '/images/teams/sigil/book/_11.png',
    class: 'show_adv_book',
    callback: () => hg.views.AdventureBookView.show(user.quests.QuestAdventureBook.adventure.type),
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'show-adventure-book',
  name: 'Show Adventure Book',
  type: 'feature',
  default: false,
  description: 'Add an Adventure Book button to the Kingdom dropdown menu.',
  load: init,
};
