import { addStyles, onEvent } from '@utils';
import styles from './styles.css';

const makeListItems = (itemList) => {
  const list = document.createElement('ul');
  list.classList.add('better-journal-list');

  if (0 === itemList.length) {
    return list;
  }

  itemList.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = item.trim();
    list.append(listItem);
  });

  return list;
};

const splitText = (text) => {
  const splitItems = text.split(/, | and /);
  return splitItems.map((item) => item.trim()).filter(Boolean);
};

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
        newText: 'I received:',
      };
    }

    return {
      list: splitText(suffix[0]),
      newText: `I opened ${suffix[1]} and received:`,
    };
  }
};

/**
 * Format a journal entry as a list.
 *
 * @param {Object}  args       The entry arguments.
 * @param {Element} args.entry The journal entry.
 * @param {Element} args.text  The journal entry text.
 */
const formatAsList = async (args) => {
  const { entry, text } = args;

  const processed = entry.getAttribute('data-better-journal-processed');
  if (processed) {
    return;
  }

  const lootClassesToCheck = [
    'bonuscatchsuccess',
    'catchsuccess',
    'catchsuccessloot',
    'luckycatchsuccess',
  ];

  const convertibleClassesToCheck = [
    'convertible_open',
  ];

  const classes = new Set(entry.classList);

  let type;

  // Check if the entry is in either of the classes, and then call the function to format it as a list
  if (lootClassesToCheck.some((c) => classes.has(c))) {
    type = 'loot';
  } else if (convertibleClassesToCheck.some((c) => classes.has(c))) {
    type = 'convertible';
  } else {
    return;
  }

  entry.setAttribute('data-better-journal-processed', 'true');

  const { newText, list } = getItemsFromText(type, text);

  text.innerHTML = newText;
  text.append(makeListItems(list));
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-list');

  onEvent('better-journal-update', formatAsList);
};
