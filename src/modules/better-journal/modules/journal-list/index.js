import { addStyles, makeElement } from '@utils';
import onJournalEntry from '../../utils';

import styles from './styles.css';

const classesToCheck = {
  loot: [
    'bonuscatchsuccess',
    'catchsuccess',
    'catchsuccessprize',
    'catchsuccessloot',
    'luckycatchsuccess',
    'catchsuccessprize',
  ],
  convertible: [
    'convertible_open',
  ],
  other: [
    'iceberg_defeated',
    'dailyreward',
    'kings_giveaway_bonus_prize_entry',
  ],
  hasListNeedsClasses: [
    'folkloreForest-bookClaimed',
  ],
};

const otherStrings = [
  'the following loot</b>',
  'Inside my chest was',
  'Inside I found',
  'I found',
  'I found</b>',
  'Inside, I found</b>',
  'Loyalty Chest and received:',
];

/**
 * Create a list of items.
 *
 * @param {Array} itemList The list of items.
 *
 * @return {HTMLElement} The list.
 */
const makeListItems = (itemList) => {
  const list = makeElement('ul', 'better-journal-list');
  if (0 === itemList.length) {
    return list;
  }

  itemList.forEach((item) => {
    makeElement('li', 'better-journal-list-item', item, list);
  });

  return list;
};

/**
 * Split the text into items.
 *
 * @param {string} text The text to split.
 *
 * @return {Array} The list of items.
 */
const splitText = (text) => {
  const items = text.split(/, (?=\d)| and (?=\d)/);
  return items.map((item) => item.trim()).filter(Boolean);
};

/**
 * Get the items from the text.
 *
 * @param {string}      type The type of journal entry.
 * @param {HTMLElement} text The text element.
 *
 * @return {Object} The items and the new text.
 */
const getItemsFromText = (type, text) => {
  const innerHTML = text.innerHTML;
  let items;
  let list;
  let newText;

  // If it's a loot list, the items are after "that dropped".
  if ('loot' === type) {
    items = innerHTML.split(' that dropped ');
    if (items.length >= 2) {
      list = splitText(items[1]);
      newText = `${items[0]} that dropped:`;
    } else {
      items = innerHTML.split('<b>that dropped</b> ');
      if (items.length >= 2) {
        list = splitText(items[1]);
        newText = `${items[0]} that dropped:`;
      }
    }
  } else if ('convertible' === type) {
    // A convertible item is opened and the items are after "I opened".
    items = innerHTML.split('I received ');

    if (items.length >= 2) {
      const suffix = items[1].split(' from ');
      let suffixString = suffix[1];
      if (suffix.length >= 2) {
        // remove the trailing . if it exists
        if (suffixString.endsWith('.')) {
          suffixString = suffixString.slice(0, -1);
        }

        list = splitText(suffix[0]);
        newText = `I opened ${suffixString} and received:`;
      } else {
        list = splitText(items[1]);
        newText = 'I received: ';
      }
    }
  } else {
    for (const string of otherStrings) {
      // If it's an "other" type, the items are after a specific string.
      if (innerHTML.includes(string)) {
        items = innerHTML.split(string);
        list = splitText(items[1]);
        newText = `${items[0]} ${string}: `;
        break;
      }
    }
  }

  return {
    list: list || [],
    newText: newText || innerHTML,
  };
};

const addClassesToLiAndUl = (text) => {
  const list = text.querySelector('ul');
  if (list) {
    list.classList.add('better-journal-list');
    list.querySelectorAll('li').forEach((li) => {
      li.classList.add('better-journal-list-item');
    });
  }
};

/**
 * Format a journal entry as a list.
 *
 * @param {Object} entry The journal entry to format.
 */
const formatAsList = async (entry) => {
  const processed = entry.getAttribute('data-better-journal-processed');
  if (processed) {
    return;
  }

  const classes = new Set(entry.classList);

  let type;

  entry.setAttribute('data-better-journal-processed', 'true');

  const text = entry.querySelector('.journalbody .journaltext');
  if (! text) {
    return;
  }

  // Determine the type of journal entry and compare it to the classes we have.
  for (const [key, value] of Object.entries(classesToCheck)) {
    if (value.some((c) => classes.has(c))) {
      type = key;
      break;
    }
  }

  if ('update' === type) {
    addClassesToLiAndUl(text);
    return;
  }

  const { newText, list } = getItemsFromText(type, text);
  if (list.length > 0 && newText !== text.innerHTML) {
    text.innerHTML = newText;
    text.append(makeListItems(list));
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-list');

  onJournalEntry(formatAsList, 3000);
};
