import { addEvent, addStyles, makeElement } from '@utils';

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
const getItemsFromText = (type, text) => {
  let items;
  if ('loot' === type) {
    items = text.innerHTML.split(' that dropped ');
    if (items.length < 2) {
      return {
        list: [],
        newText: text.innerHTML,
      };
    }

    return {
      items,
      list: splitText(items[1]),
      newText: `${items[0]} that dropped:`,
    };
  }

  if ('convertible' === type) {
    items = text.innerHTML.split('I received ');
    if (items.length < 2) {
      return {
        list: [],
        newText: text.innerHTML,
      };
    }

    // if it's a convertible, we want to get the "from X gifts" part as well
    const suffix = items[1].split(' from ');
    if (suffix.length < 2) {
      return {
        list: splitText(items[1]),
        newText: 'I received: ',
      };
    }

    let suffixString = suffix[1];
    // remove the trailing . if it exists
    if (suffixString.endsWith('.')) {
      suffixString = suffixString.slice(0, -1);
    }

    return {
      list: splitText(suffix[0]),
      newText: `I opened ${suffixString} and received:`,
    };
  }

  // if the text contains "the following loot</b>", we want to split it there
  // if the text contains "Inside my chest was", we want to split it there

  if (text.innerHTML.includes('the following loot</b>')) {
    items = text.innerHTML.split('the following loot</b>');
    return {
      list: splitText(items[1]),
      newText: `${items[0]} the following loot</b>: `,
    };
  }

  if (text.innerHTML.includes('Inside my chest was')) {
    items = text.innerHTML.split('Inside my chest was');
    return {
      list: splitText(items[1]),
      newText: `${items[0]} Inside my chest was: `,
    };
  }

  return {
    list: [],
    newText: text.innerHTML,
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

  const classes = new Set(entry.classList);

  let type;

  // Check if the entry is in either of the classes, and then call the function to format it as a list
  if (lootClassesToCheck.some((c) => classes.has(c))) {
    type = 'loot';
  } else if (convertibleClassesToCheck.some((c) => classes.has(c))) {
    type = 'convertible';
  } else if (otherClassesToCheck.some((c) => classes.has(c))) {
    type = 'other';
  } else {
    return;
  }

  entry.setAttribute('data-better-journal-processed', 'true');

  const text = entry.querySelector('.journalbody .journaltext');

  const { newText, list } = getItemsFromText(type, text);

  text.innerHTML = newText;
  text.append(makeListItems(list));
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-list');

  addEvent('journal-entry', formatAsList, { weight: 3000, id: 'better-journal-list' });
};
