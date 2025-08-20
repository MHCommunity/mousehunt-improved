import {
  addStyles,
  doEvent,
  getData,
  makeElement,
  onJournalEntry,
  unpluralize
} from '@utils';

import styles from './styles.css';

const classesToCheck = {
  loot: [
    'bonuscatchsuccess',
    'catchsuccess',
    'catchsuccessprize',
    'catchsuccessloot',
    'luckycatchsuccess',
    'catchsuccessprize',
    'relicHunter_catch',
  ],
  convertible: [
    'convertible_open',
  ],
  other: [
    'iceberg_defeated',
    'dailyreward',
    'claimGolemReward',
  ],
  hasListNeedsClasses: [
    'folkloreForest-bookClaimed',
    'schoolOfSorcery-completed',
    'schoolOfSorcery-droppedOut',
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
  'I sifted through my Dragon Nest and found</b>',
  'my Skyfarer\'s Oculus and discovered the following loot:',
  'my Skyfarer\'s Oculus and discovered:',
  'My golem returned from |*| with',
];

const classesToSkip = [
  'mountain-boulderLooted',
  'labyrinth-exitMaze',
  'festiveSpiritLootBoost',
  'spring_hunt_charge_trinket_effect',
  'harbour',
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

let allItems = null;
/**
 * Split the text into items.
 *
 * @param {string} text The text to split.
 *
 * @return {Array} The list of items.
 */
const splitText = async (text) => {
  const items = text.split(/<br>|, (?=\d)| and (?=\d)/);

  if (! allItems) {
    allItems = await getData('items');
  }

  const processedItems = items.map((item) => {
    const itemData = allItems.find((i) => i.name === item.trim().replace(/^\d+ /, ''));
    if (itemData) {
      return `<a class="loot" title="" href="https://www.mousehuntgame.com/item.php?item_type=${itemData.type}" onclick="hg.views.ItemView.show('${itemData.type}'); return false;">${item}</a>`;
    }

    // if the last character is a comma, remove it.
    if (item.endsWith(',')) {
      item = item.slice(0, -1);
    }

    return item.trim();
  }).filter(Boolean);

  return processedItems;
};

/**
 * Get the items from the text.
 *
 * @param {string}      type The type of journal entry.
 * @param {HTMLElement} text The text element.
 *
 * @return {Object} The items and the new text.
 */
const getItemsFromText = async (type, text) => {
  const innerHTML = text.innerHTML;
  let items;
  let list;
  let newText;

  // If it's a loot list, the items are after "that dropped".
  if ('loot' === type) {
    if (innerHTML.includes(' that dropped ')) {
      items = innerHTML.split(' that dropped ');
      if (items.length >= 2) {
        list = await splitText(items[1]);
        newText = `${items[0]} that dropped:`;
      } else {
        items = innerHTML.split('<b>that dropped</b> ');
        if (items.length >= 2) {
          list = await splitText(items[1]);
          newText = `${items[0]} that dropped:`;
        }
      }
    } else if (innerHTML.includes('She dropped ')) {
      items = innerHTML.split('She dropped ');
      if (items.length >= 2) {
        list = await splitText(items[1]);
        newText = `${items[0]}She dropped:`;
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

        list = await splitText(suffix[0]);
        newText = `I opened ${suffixString} and received:`;
      } else {
        list = await splitText(items[1]);
        newText = 'I received: ';
      }
    }
  } else if ('hasListNeedsClasses' === type) {
    // It's a <ul> list. split it by <li> and dont remove any items.
    const ul = text.querySelector('ul');
    ul.classList.add('better-journal-list');

    ul.querySelectorAll('li').forEach((li) => {
      li.classList.add('better-journal-list-item');
    });
  } else {
    for (const string of otherStrings) {
      // If it's an "other" type, the items are after a specific string.
      if (innerHTML.includes(string)) {
        items = innerHTML.split(string);
        list = await splitText(items[1]);
        newText = `${items[0]} ${string}: `.replace('::', ':');
        break;
      }

      if (string.includes('|*|')) {
        const splitCheck = string.split('|*|');
        if (splitCheck[0] && innerHTML.includes(splitCheck[0])) {
          const splitString = string.replace('|*|', '(.*)');
          const regex = new RegExp(splitString);
          const match = innerHTML.match(regex);
          if (match) {
            items = innerHTML.split(match[0]);
            list = await splitText(items[1]);
            newText = `${items[0]} ${match[0]}`;
            break;
          }
        }
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

  if (classesToSkip.some((c) => classes.has(c))) {
    return;
  }

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

  const { newText, list } = await getItemsFromText(type, text);
  if (list.length > 0 && newText !== text.innerHTML) {
    text.innerHTML = newText;
    if ('hasListNeedsClasses' !== type) {
      text.append(makeListItems(list));
    }
  }
};

const formatXasList = async (entry) => {
  // the entry will have text that looks like this: <p class="mhi-x-entry"><span class="dot"> • </span>100 x Lavish Lapis Beans<br></p> that we want to turn into a list.
  // We can query the items JSON to match the item name to the item type and then link to the item page.
  const processed = entry.getAttribute('data-better-journal-processed-x-list');
  if (processed) {
    return;
  }

  const text = entry.querySelector('.journalbody .journaltext');
  if (! text) {
    return;
  }

  const xList = text.querySelectorAll('.mhi-x-entry');
  if (! xList.length) {
    return;
  }

  const items = await getData('items');

  let firstEl;
  const list = makeElement('ul', 'better-journal-list');
  for (const x of xList) {
    // Remove the dot.
    const dot = x.querySelector('.dot');
    if (dot) {
      dot.remove();
    }

    // Split on the ' x ' to get the quantity and item name.
    const splitxText = x.textContent.split(' x ');
    if (splitxText.length < 2) {
      continue;
    }

    const quantity = splitxText[0];
    const itemName = splitxText[1];

    // Find the item type from the items JSON.
    let item = items.find((i) => i.name === unpluralize(itemName).trim());
    if (! item) {
      // try removing the trailing s and try again.
      item = items.find((i) => i.name === unpluralize(itemName).trim().replace(/s$/, ''));
      if (! item) {
        continue; // If we still can't find it, skip this item.
      }
    }

    const link = makeElement('a', 'loot', itemName);
    link.href = `https://www.mousehuntgame.com/item.php?item_type=${item.type}`;
    link.setAttribute('onclick', `hg.views.ItemView.show('${item.type}'); return false;`);
    link.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.ItemView.show(item.type);
    });

    const listItem = makeElement('li', 'better-journal-list-item');
    listItem.append(`${Number.parseInt(quantity.trim(), 10).toLocaleString()} `);
    listItem.append(link);

    list.append(listItem);

    // We replace the first element with the list, otherwise we remove the element.
    if (firstEl) {
      x.remove();
    } else {
      firstEl = x;
    }
  }

  if (firstEl) {
    firstEl.replaceWith(list);
    entry.setAttribute('data-better-journal-processed-x-list', 'true');

    doEvent('journal-item-link-modified', entry);
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-list');

  onJournalEntry(formatAsList, 3000);
  onJournalEntry(formatXasList, 4000);
};
