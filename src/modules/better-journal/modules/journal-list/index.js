import { addStyles, makeElement } from '@utils';
import onJournalEntry from '../../journal-event';

import styles from './styles.css';

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
const otherStrings = [
  'the following loot</b>',
  'Inside my chest was',
  'Loyalty Chest and received:',
];

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

  const lootClassesToCheck = [
    'bonuscatchsuccess',
    'catchsuccess',
    'catchsuccessloot',
    'luckycatchsuccess',
    'catchsuccessprize',
  ];

  const convertibleClassesToCheck = [
    'convertible_open',
  ];

  const otherClassesToCheck = [
    'iceberg_defeated',
    'dailyreward',
  ];

  const updateClassesForClasses = [
    'folkloreForest-bookClaimed',
  ];

  const classes = new Set(entry.classList);

  let type;

  // Check if the entry is in either of the classes, and then call the function to format it as a list
  if (lootClassesToCheck.some((c) => classes.has(c))) {
    type = 'loot';
  } else if (convertibleClassesToCheck.some((c) => classes.has(c))) {
    type = 'convertible';
  } else if (otherClassesToCheck.some((c) => classes.has(c))) {
    type = 'other';
  } else if (updateClassesForClasses.some((c) => classes.has(c))) {
    type = 'update';
  } else {
    return;
  }

  entry.setAttribute('data-better-journal-processed', 'true');

  const text = entry.querySelector('.journalbody .journaltext');

  if ('update' === type) {
    // Find the ul and add the class to it and the li elements
    const list = text.querySelector('ul');
    if (list) {
      list.classList.add('better-journal-list');
      list.querySelectorAll('li').forEach((li) => {
        li.classList.add('better-journal-list-item');
      });
    }
  } else {
    const { newText, list } = getItemsFromText(type, text);

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
