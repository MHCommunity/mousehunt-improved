import {
  addStyles,
  getData,
  makeElement,
  onJournalEntry,
  unpluralize
} from '@utils';

import styles from './styles.css';

const classTypeMap = Object.entries({
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
    'convertible_open'
  ],
  other: [
    'iceberg_defeated',
    'dailyreward',
    'claimGolemReward',
    'folkloreForest-bookClaimed',
    'gloomyGreenwood-incense',
  ],
  hasListNeedsClasses: [
    'schoolOfSorcery-completed',
    'schoolOfSorcery-droppedOut',
    'epilogueFalls-finishRiverRun',
  ],
}).reduce((acc, [k, arr]) => {
  arr.forEach((c) => {
    acc[c] = k;
  });
  return acc;
}, {});

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
  'scared up an additional:',
  'the following bonus loot:',
];

const classesToSkip = new Set([
  'mountain-boulderLooted',
  'labyrinth-exitMaze',
  'festiveSpiritLootBoost',
  'spring_hunt_charge_trinket_effect',
  'harbour',
]);

let allItems = null;
let itemLookup = null; // { lowerName: item, singularLowerName: item }

/**
 * Build lookup maps for quick item resolution.
 *
 * @param {Array} items Array of item objects.
 *
 * @return {Object} Map totalItemsElf lower-cased item names and singular names to item objects.
 */
const buildItemLookup = (items) => {
  const map = Object.create(null);

  if (! items || ! Array.isArray(items)) {
    return map;
  }

  for (const it of items) {
    const name = (it.name || '').trim();
    if (! name) {
      continue;
    }
    map[name.toLowerCase()] = it;
    const singular = unpluralize(name).trim().toLowerCase();
    if (singular) {
      map[singular] = it;
    }
  }
  return map;
};
/**
 * Split raw text into item fragments.
 *
 * @param {string} raw The raw text.
 *
 * @return {Array} The item fragments.
 */
const splitText = (raw) => {
  if (! raw) {
    return [];
  }
  // Normalize <br> to newline, then split on newline or ", " or " and " when followed by digit
  const norm = raw.replaceAll(/<br\s*\/?>/gi, '\n');
  // split keeping meaningful fragments
  const parts = norm.split(/\n|,\s+(?=\d)|\s+and\s+(?=\d)/i).map((s) => s.trim()).filter(Boolean);
  return parts;
};

/**
 * Convert an item fragment "N x Name" into quantity and anchor.
 *
 * @param {string|HTMLElement} textLike The text or element containing the text.
 *
 * @return {Object|boolean} Object with `quantity` and `link` properties, or false if not matched/resolved.
 */
const convertTextToItemLink = (textLike) => {
  const text = (typeof textLike === 'string') ? textLike : (textLike.textContent || '');
  const m = text.match(/^\s*(\d+)\s*x\s*(.+?)\s*$/i);
  if (! m) {
    return false;
  }
  const name = m[2].trim();
  const key = name.toLowerCase();
  const item = itemLookup[key] || itemLookup[unpluralize(name).toLowerCase()] || itemLookup[key.replace(/s$/, '')];
  if (! item) {
    return false;
  }

  const link = makeElement('a', 'loot', name);
  link.href = `https://www.mousehuntgame.com/item.php?item_type=${item.type}`;
  link.setAttribute('onclick', `hg.views.ItemView.show('${item.type}'); return false;`);
  link.addEventListener('click', (e) => {
    e.preventDefault();
    hg.views.ItemView.show(item.type);
  });

  return {
    quantity: Number.parseInt(m[1], 10).toLocaleString(),
    link,
  };
};

/**
 * Convert array of item fragment strings to a UL element.
 *
 * @param {Array} itemList The array of item fragment strings.
 *
 * @return {HTMLElement} The UL element.
 */
const makeListItems = (itemList) => {
  const list = makeElement('ul', 'better-journal-list');
  if (! itemList || itemList.length === 0) {
    return list;
  }

  const frag = document.createDocumentFragment();
  for (const raw of itemList) {
    const li = makeElement('li', 'better-journal-list-item');
    const cleaned = raw.replace(/^•\s*/, '');
    const conv = convertTextToItemLink(cleaned);
    if (conv) {
      // build DOM safely: text node for quantity, then the anchor element
      li.append(document.createTextNode(`${conv.quantity} `));
      li.append(conv.link);
    } else {
      // preserve original trimmed text, stripping "N x" quantity prefix
      li.innerHTML = cleaned.replace(/,$/, '').replace(/^(\d+)\s+x\s+/, '$1 ').trim();
    }
    frag.append(li);
  }
  list.append(frag);
  return list;
};

const addClassesToLiAndUl = (root) => {
  root.querySelectorAll('ul').forEach((ul) => {
    ul.classList.add('better-journal-list');
    ul.querySelectorAll(':scope > li').forEach((li) => li.classList.add('better-journal-list-item'));
  });
};

/**
 * Special handling for folkloreForest bookClaimed entries.
 *
 * @param {HTMLElement} textEl The text element.
 *
 * @return {boolean} True if handled, false if not.
 */
const handleFolkloreBookClaim = (textEl) => {
  const html = textEl.innerHTML;
  const marker = 'earned me the following rewards:';
  const afterMarker = '<br><br>I looted the following items while writing:<br><br>';
  if (! html.includes(marker) && ! html.includes(afterMarker)) {
    return false;
  }

  // Extract sections
  let prefix = html;
  let rewardsRaw = '';
  let lootRaw = '';

  if (html.includes(marker)) {
    const parts = html.split(marker);
    prefix = parts[0];
    const rest = parts[1] || '';
    if (rest.includes(afterMarker)) {
      [rewardsRaw, lootRaw] = rest.split(afterMarker);
    } else {
      rewardsRaw = rest;
    }
  } else {
    const parts = html.split(afterMarker);
    prefix = parts[0];
    lootRaw = parts[1] || '';
  }

  // Build rewards list if present
  let rewardsHTML = '';
  if (rewardsRaw) {
    const cleaned = rewardsRaw.replace(/^<br><br>/, '').replace(/<br><br>$/, '');
    const lines = cleaned.split('<br>').map((s) => s.replace(/^•&nbsp;?/, '').trim()).filter(Boolean);
    if (lines.length) {
      const ul = makeElement('ul', 'better-journal-list');
      const frag = document.createDocumentFragment();
      for (const line of lines) {
        const li = makeElement('li', 'better-journal-list-item');
        li.innerHTML = line.replaceAll('class="item"', 'class="loot"');
        frag.append(li);
      }
      ul.append(frag);
      rewardsHTML = `${marker} ${ul.outerHTML}`;
    } else {
      rewardsHTML = marker;
    }
  }

  let newHTML = prefix;
  if (rewardsHTML) {
    newHTML += rewardsHTML;
  }
  if (lootRaw) {
    newHTML += `${afterMarker}${lootRaw}`;
  }

  textEl.innerHTML = newHTML;
  addClassesToLiAndUl(textEl);
  return true;
};

const getItemsFromText = (type, textEl) => {
  const innerHTML = textEl.innerHTML;
  let list = [];
  let newText = innerHTML;

  if (type === 'loot') {
    const checks = [
      ' dropped the following loot:</b>',
      ' dropped the following loot:',
      'She dropped ',
      ' that dropped ',
      '<b>that dropped</b> ',
    ];
    for (const chk of checks) {
      if (innerHTML.includes(chk)) {
        const parts = innerHTML.split(chk);
        if (parts.length >= 2) {
          const right = parts[1];
          list = splitText(right);
          newText = `${parts[0]}${chk.replaceAll(/<\/?b>/g, '')}`;
          break;
        }
      }
    }
  } else if (type === 'convertible') {
    if (innerHTML.includes('I received ')) {
      const parts = innerHTML.split('I received ');
      if (parts.length >= 2) {
        const suffix = parts[1].split(' from ');
        if (suffix.length >= 2) {
          let suffixString = suffix[1];
          if (suffixString.endsWith('.')) {
            suffixString = suffixString.slice(0, -1);
          }
          list = splitText(suffix[0]);
          newText = `I opened ${suffixString} and received:`;
        } else {
          list = splitText(parts[1]);
          newText = 'I received: ';
        }
      }
    }
  } else if (type === 'hasListNeedsClasses') {
    // Ensure every UL gets our classes
    textEl.querySelectorAll('ul').forEach((ul) => {
      ul.classList.add('better-journal-list');
      ul.querySelectorAll(':scope > li').forEach((li) => li.classList.add('better-journal-list-item'));
    });
    return { list: [], newText: innerHTML };
  } else if (innerHTML.includes('created an additional:')) {
    const parts = innerHTML.split('created an additional:');
    if (parts.length >= 2) {
      list = splitText(parts[1]);
      newText = `${parts[0]}created an additional:`;
    }
  } else {
    for (const s of otherStrings) {
      if (s.includes('|*|')) {
        const parts = s.split('|*|');
        if (parts[0] && innerHTML.includes(parts[0])) {
          const regex = new RegExp(s.replace('|*|', '(.*)'));
          const match = innerHTML.match(regex);
          if (match) {
            const parts2 = innerHTML.split(match[0]);
            list = splitText(parts2[1]);
            newText = `${parts2[0]} ${match[0]}`;
            break;
          }
        }
      } else if (innerHTML.includes(s)) {
        const parts = innerHTML.split(s);
        list = splitText(parts[1] || '');
        newText = `${parts[0]} ${s}: `.replace('::', ':');
        break;
      }
    }
  }

  return { list: list || [], newText: newText || innerHTML };
};

/**
 * Format a journal entry as a list.
 *
 * @param {HTMLElement} entry The journal entry element.
 *
 * @return {Promise<void>} Resolves when done.
 */
const formatAsList = async (entry) => {
  if (! entry || ! entry.classList) {
    return;
  }

  const processed = entry.getAttribute('data-better-journal-processed');
  if (processed) {
    return;
  }

  let type;
  for (const cls of entry.classList) {
    if (classesToSkip.has(cls)) {
      return;
    }
    if (! type && classTypeMap[cls]) {
      type = classTypeMap[cls];
    }
  }

  const textEl = entry.querySelector('.journalbody .journaltext');
  if (! textEl) {
    return;
  }

  // Folklore fast-path
  if (entry.classList.contains('folkloreForest-bookClaimed') && handleFolkloreBookClaim(textEl)) {
    entry.setAttribute('data-better-journal-processed', 'true');
    return;
  }

  if (type === 'update') {
    addClassesToLiAndUl(textEl);
    entry.setAttribute('data-better-journal-processed', 'true');
    return;
  }

  const { newText, list } = getItemsFromText(type, textEl);
  if (list.length > 0 && newText !== textEl.innerHTML) {
    // replace text content and append list
    textEl.innerHTML = newText;
    if (type !== 'hasListNeedsClasses') {
      const listItems = makeListItems(list);
      textEl.append(listItems);
    }
  }

  entry.setAttribute('data-better-journal-processed', 'true');
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-list');

  allItems = await getData('items');
  itemLookup = buildItemLookup(allItems);

  onJournalEntry(formatAsList, {
    id: 'better-journal-list-format',
    weight: 3000,
  });
};
