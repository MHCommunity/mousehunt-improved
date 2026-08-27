import { addStyles, debuglog, formatNumber, getData, makeElement, onJournalEntry, unpluralize } from '@utils';

import { LOOT_INTRO_PHRASES } from '../../shared/loot-intros';
import { shouldSkipJournalItemLink } from '../../shared/item-linking';
import styles from './styles.css';

const classTypeMap = Object.entries({
  loot: ['bonuscatchsuccess', 'catchsuccess', 'catchsuccessprize', 'catchsuccessloot', 'luckycatchsuccess', 'catchsuccessprize', 'relicHunter_catch'],
  convertible: ['convertible_open'],
  other: ['iceberg_defeated', 'dailyreward', 'claimGolemReward', 'folkloreForest-bookClaimed', 'gloomyGreenwood-incense'],
  hasListNeedsClasses: ['schoolOfSorcery-completed', 'schoolOfSorcery-droppedOut', 'epilogueFalls-finishRiverRun'],
}).reduce((acc, [k, arr]) => {
  arr.forEach((c) => {
    acc[c] = k;
  });
  return acc;
}, {});

const classesToSkip = new Set(['mountain-boulderLooted', 'labyrinth-exitMaze', 'festiveSpiritLootBoost', 'spring_hunt_charge_trinket_effect', 'harbour']);

/**
 * Item mentions that should stay plain text in specific entries, keyed by
 * entry class: the Polar Vortex squall entry mentions the consumed Cyclone
 * Stone, which is trap setup rather than loot.
 */
const skipTextLinksByClass = {
  noelWeaponEffect: ['cyclone stone'],
};

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

  if (!items || !Array.isArray(items)) {
    return map;
  }

  for (const it of items) {
    const name = (it.name || '').trim();
    if (!name) {
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
  if (!raw) {
    return [];
  }
  // Normalize <br> to newline, then split on newline or ", " or " and " when followed by digit
  const norm = raw.replaceAll(/<br\s*\/?>/gi, '\n');
  // split keeping meaningful fragments
  const parts = norm
    .split(/\n|,\s+(?=\d)|\s+and\s+(?=\d)/i)
    .map((s) => s.trim())
    .filter(Boolean);
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
  const text = typeof textLike === 'string' ? textLike : textLike.textContent || '';
  const m = text.match(/^\s*(\d+)\s*x\s*(.+?)\s*$/i);
  if (!m) {
    return false;
  }
  const name = m[2].trim();
  const key = name.toLowerCase();
  const item = itemLookup[key] || itemLookup[unpluralize(name).toLowerCase()] || itemLookup[key.replace(/s$/, '')];
  if (!item) {
    return false;
  }

  return {
    quantity: formatNumber(Number.parseInt(m[1], 10)),
    link: makeItemLink(item, name),
  };
};

/**
 * Make a loot link for an item.
 *
 * @param {Object} item The item data.
 * @param {string} name The text for the link.
 *
 * @return {HTMLElement} The link element.
 */
const makeItemLink = (item, name) => {
  const link = makeElement('a', 'loot', name);
  link.href = `https://www.mousehuntgame.com/item.php?item_type=${item.type}`;
  link.setAttribute('onclick', `hg.views.ItemView.show('${item.type}'); return false;`);

  return link;
};

/**
 * Find known item names in a text string.
 *
 * Starting at each capitalized word, greedily match the longest phrase that
 * resolves to a known item. Single-word matches only count when they follow a
 * quantity, so common words that happen to be item names (Gold, Points, Gift)
 * aren't linked in regular prose.
 *
 * @param {string} text      The text to search.
 * @param {Set}    skipNames Lower-cased item names to leave as plain text.
 *
 * @return {Array} Matches as `{ start, name, item }`, in order.
 */
const findItemsInText = (text, skipNames) => {
  const matches = [];
  const wordStart = /[A-Z][\w'+|’-]*/g;

  let m;
  while ((m = wordStart.exec(text)) !== null) {
    const start = m.index;
    const words = text.slice(start).split(/(\s+)/);

    let best = null;
    let phrase = '';
    let wordCount = 0;

    for (const part of words) {
      phrase += part;
      if (!part.trim()) {
        continue;
      }

      wordCount++;
      if (wordCount > 6) {
        break;
      }

      const cleaned = phrase.replace(/[!,.:;]+$/, '');
      const item = itemLookup[cleaned.toLowerCase()] || itemLookup[unpluralize(cleaned).toLowerCase()];
      if (item) {
        best = { start, name: cleaned, item, words: wordCount };
      }
    }

    if (!best) {
      continue;
    }

    // Only link single words when they directly follow a quantity.
    const precededByQuantity = /\d[\d,]*\s*x?\s*$/.test(text.slice(0, start));
    if (best.words > 1 || precededByQuantity) {
      if (!shouldSkipJournalItemLink(best.item) && !skipNames?.has(best.item.name.toLowerCase())) {
        matches.push(best);
      }

      // Advance past the phrase even when skipped so words inside a skipped
      // item's name can't match as separate items.
      wordStart.lastIndex = start + best.name.length;
    }
  }

  return matches;
};

/**
 * Wrap known item names in loot links within an element's text, so entries
 * that only mention items in prose still get icons and hover cards.
 *
 * @param {HTMLElement} textEl    The text element.
 * @param {Set}         skipNames Lower-cased item names to leave as plain text.
 */
const linkifyItemsInText = (textEl, skipNames) => {
  const walker = document.createTreeWalker(textEl, NodeFilter.SHOW_TEXT, {
    /**
     * Skip text that's already inside a link.
     *
     * @param {Node} node The text node.
     *
     * @return {number} Whether to accept the node.
     */
    acceptNode: (node) => {
      return node.parentElement?.closest('a') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    const text = node.textContent;
    const found = findItemsInText(text, skipNames);
    if (!found.length) {
      continue;
    }

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const { start, name, item } of found) {
      if (start > lastIndex) {
        fragment.append(document.createTextNode(text.slice(lastIndex, start)));
      }

      fragment.append(makeItemLink(item, name));
      lastIndex = start + name.length;
    }

    if (lastIndex < text.length) {
      fragment.append(document.createTextNode(text.slice(lastIndex)));
    }

    node.replaceWith(fragment);
  }
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
  if (!itemList || itemList.length === 0) {
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
      li.innerHTML = cleaned
        .replace(/,$/, '')
        .replace(/^(\d+)\s+x\s+/, '$1 ')
        .trim();
    }
    frag.append(li);
  }
  list.append(frag);
  return list;
};

/**
 * Format the items that follow a colon as a list (for entries like the
 * refractor base or Polar Vortex Trap, where the loot is listed inline after
 * a colon). Only converts when everything after the colon reads as item
 * quantities and links, so prose colons stay untouched.
 *
 * @param {HTMLElement} textEl The text element.
 */
const listifyAfterColon = (textEl) => {
  // Find a colon in the entry's text — searching the HTML instead would match
  // the "https:" inside link attributes and mangle the markup. Skip colons
  // that follow a digit so times like "3:00pm" aren't treated as intros.
  const walker = document.createTreeWalker(textEl, NodeFilter.SHOW_TEXT);

  let colonNode = null;
  let colonIndex = -1;
  while (!colonNode && walker.nextNode()) {
    const text = walker.currentNode.textContent;
    for (let i = text.indexOf(':'); i !== -1; i = text.indexOf(':', i + 1)) {
      if (!/\d/.test(text.charAt(i - 1))) {
        colonNode = walker.currentNode;
        colonIndex = i;
        break;
      }
    }
  }

  if (!colonNode) {
    return;
  }

  // Everything after the colon is the item list candidate.
  const range = document.createRange();
  range.setStart(colonNode, colonIndex + 1);
  range.setEnd(textEl, textEl.childNodes.length);

  const rest = makeElement('div');
  rest.append(range.cloneContents());

  const list = splitText(rest.innerHTML)
    .map((fragment) => fragment.replace(/[!.]+$/, '').trim())
    .filter(Boolean);

  // Every fragment must be a quantity followed by a linked item, so regular
  // sentences that happen to contain a colon are left alone.
  const isItemList = list.length > 0 && list.every((fragment) => /^\d[\d,]*\s*(x\s*)?<a\s[^>]*>[^<]*<\/a>$/i.test(fragment));
  if (!isItemList) {
    return;
  }

  range.deleteContents();
  textEl.append(makeListItems(list));
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
  if (!html.includes(marker) && !html.includes(afterMarker)) {
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
    const lines = cleaned
      .split('<br>')
      .map((s) => s.replace(/^•&nbsp;?/, '').trim())
      .filter(Boolean);
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
      '<b>The mouse also dropped the following loot:</b>',
      '<b>the mouse also dropped the following loot:</b>',
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
          newText = `${parts[0]}${chk.replaceAll(/<\/?b>/g, '')}`.trimEnd();
          if (!newText.endsWith(':')) {
            newText += ':';
          }
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
    for (const s of LOOT_INTRO_PHRASES) {
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

  // Generic fallback: many entries (e.g. trap-trigger effects like Spotlight
  // Enchantment, "found an additional", etc.) list their loot as bullet (•)
  // separated lines with <br>s and already-built item links, but use intro
  // phrasing we don't have an explicit string for. Rather than chase every
  // variant, detect the bullet list directly: split at the first bullet into
  // intro text + item lines.
  if (list.length === 0 && innerHTML.includes('•')) {
    const idx = innerHTML.indexOf('•');
    const intro = innerHTML.slice(0, idx).replace(/\s+$/, '');
    const candidate = splitText(innerHTML.slice(idx));
    if (candidate.length > 0) {
      list = candidate;
      newText = intro;
    }
  }

  return { list: list || [], newText: newText || innerHTML };
};

/**
 * Format a journal entry as a list.
 *
 * @param {Object} model The journal entry model.
 *
 * @return {Promise<void>} Resolves when done.
 */
const formatAsList = async (model) => {
  if (!itemLookup) {
    return;
  }

  const entry = model.el;
  const textEl = makeElement('div');
  textEl.innerHTML = model.html;

  let type;
  for (const cls of entry.classList) {
    if (classesToSkip.has(cls)) {
      return;
    }
    if (!type && classTypeMap[cls]) {
      type = classTypeMap[cls];
    }
  }

  // Folklore fast-path
  if (entry.classList.contains('folkloreForest-bookClaimed') && handleFolkloreBookClaim(textEl)) {
    model.setHtml(textEl.innerHTML);
    return;
  }

  if (type === 'update') {
    addClassesToLiAndUl(textEl);
    model.setHtml(textEl.innerHTML);
    return;
  }

  // Link item mentions in the text first, so entries that only mention items
  // in prose get icons and hover cards, and lists built below keep the links.
  const skipNames = new Set();
  for (const cls of entry.classList) {
    if (Object.hasOwn(skipTextLinksByClass, cls)) {
      skipTextLinksByClass[cls].forEach((name) => skipNames.add(name));
    }
  }
  linkifyItemsInText(textEl, skipNames);

  const { newText, list } = getItemsFromText(type, textEl);
  if (list.length > 0 && newText !== textEl.innerHTML) {
    // replace text content and append list
    textEl.innerHTML = newText;
    if (type !== 'hasListNeedsClasses') {
      const listItems = makeListItems(list);
      textEl.append(listItems);
    }
  } else if ('hasListNeedsClasses' !== type) {
    // No recognized loot phrasing: entries that list their loot inline after
    // a colon (like the Polar Vortex Trap squall) still become a list.
    listifyAfterColon(textEl);
  }

  model.setHtml(textEl.innerHTML);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-list');

  try {
    allItems = await getData('items');
  } catch (error) {
    debuglog('better-journal', 'Failed to fetch item data for journal list', error);
    allItems = [];
  }

  itemLookup = buildItemLookup(allItems);

  onJournalEntry(formatAsList, {
    id: 'better-journal-list-format',
    stage: 'listify',
  });
};
