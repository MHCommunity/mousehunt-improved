import {
  addStyles,
  dbGet,
  dbSet,
  doEvent,
  getCurrentPage,
  getFlag,
  getSetting,
  onRequest,
  onTurn,
  sessionGet,
  sessionSet
} from '@utils';

import journalList from './journal-list';
import settings from './settings';

import journalIconsMinimalStyles from './journal-icons-minimal/styles.css';
import journalIconsStyles from './journal-icons/styles.css';
import noStyles from './no-styles.css';

import * as imported from './styles/**/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const saveEntries = async (callback) => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const entries = document.querySelectorAll('.journal .entry');

  // reverse the entries so we can process them in order
  const reversedEntries = [...entries].reverse();

  let lastDate = '';
  reversedEntries.forEach(async (entry) => {
    const entryId = Number.parseInt(entry.getAttribute('data-entry-id'), 10);
    if (! entryId) {
      return;
    }

    const entryText = entry.querySelector('.journalbody .journaltext');
    if (! entryText) {
      return;
    }

    const original = await dbGet('journal-entries', entryId);

    if (original && original.text) {
      callback(original, entry, entryText);
      return;
    }

    const dateEl = entry.querySelector('.journaldate');

    let date = dateEl ? dateEl.innerText : lastDate;
    lastDate = date;

    date = date.split('-');

    const journalData = {
      id: entryId,
      date: date[0] ? date[0].trim() : '0:00',
      location: date[1] ? date[1].trim() : 'Unknown',
      text: entryText.innerHTML,
      type: [...entry.classList],
      mouse: entry.getAttribute('data-mouse-type') || null,
    };

    await dbSet('journal-entries', journalData);
  });
};

/**
 * For each element matching the selector, find and replace strings.
 *
 * @param {string} selector Element selector.
 * @param {Array}  strings  Array of strings to replace.
 */
const modifyText = async (selector, strings) => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(async (entry) => {
    const element = entry.querySelector('.journalbody .journaltext');

    strings.forEach(async (string) => {
      if (! Array.isArray(string) || string.length !== 2) {
        return;
      }

      const oldText = element.innerHTML;
      const newText = oldText.replace(string[0], string[1]);
      if (oldText !== newText) {
        element.innerHTML = newText;
      }
    });

    doEvent('better-journal-update', { entry, text: element });
  });
};

const wrapGoldAndPoints = () => {
  const entries = document.querySelectorAll('.journal .entry');
  if (! entries.length) {
    return;
  }

  entries.forEach((entry) => {
    // if it has the pointsGold attribute, it's already been wrapped
    if (entry.getAttribute('data-modified-points-gold')) {
      return;
    }

    entry.setAttribute('data-modified-points-gold', true);

    // Find the amount of points via a regex and wrap it in a span
    const points = entry.innerHTML.match(/worth (.+?) points/i);
    // also match the 'and X,XXX gold' part
    const gold = entry.innerHTML.match(/points and (.+?) gold/i);

    if (points) {
      entry.innerHTML = entry.innerHTML.replace(points[0], `worth <span class="mh-ui-points">${points[1]}</span> points`);
    }

    if (gold) {
      entry.innerHTML = entry.innerHTML.replace(gold[0], `points and <span class="mh-ui-gold">${gold[1]}</span> gold`);
    }
  });
};

const maybeKeepAsOriginal = (entry) => {
  const keepOriginalMice = [
    // 'stuck_snowball',
  ];

  const keepOriginalClasses = new Set([
    'lunar_lantern',
    'valentines_matchmaker',
    'vending_machine_purchase',
  ]);

  const entryId = entry.getAttribute('data-entry-id');
  if (! entryId) {
    return;
  }

  const hasOriginal = entry.getAttribute('data-is-custom-entry');
  if (hasOriginal) {
    return;
  }

  const isMouse = entry.getAttribute('data-mouse-type');
  if (isMouse && keepOriginalMice.includes(isMouse)) {
    const entryText = entry.querySelector('.journaltext');
    if (entryText) {
      // save the original text in session storage so we can use it later
      sessionSet(`mhui-custom-entry-${entryId}`, entryText.innerHTML);
      entry.setAttribute('data-is-custom-entry', true);
    }
  }

  const classList = [...entry.classList];
  if (classList.some((c) => keepOriginalClasses.has(c))) {
    const entryText = entry.querySelector('.journaltext');
    if (entryText) {
      // save the original text in session storage so we can use it later
      sessionSet(`mhui-custom-entry-${entryId}`, entryText.innerHTML);
      entry.setAttribute('data-is-custom-entry', true);
    }
  }
};

const maybeRestoreOriginalEntry = (entry) => {
  const entryId = entry.getAttribute('data-entry-id');
  const originalText = sessionGet(`mhui-custom-entry-${entryId}`);

  if (originalText) {
    entry.querySelector('.journaltext').innerHTML = originalText;
  }
};

/**
 * Update text in journal entries.
 */
const updateJournalText = async () => {
  // Save the original journal entries
  await saveEntries((original, entry, entryText) => {
    if (original.text && entryText.innerHTML !== original.text && entry.getAttribute('data-updated') !== 'true') {
      return;
    }

    entry.setAttribute('data-updated', true);
  });

  wrapGoldAndPoints();

  const entries = document.querySelectorAll('.journal .entry');
  entries.forEach((entry) => {
    maybeKeepAsOriginal(entry);
  });

  modifyText('.journal .entry', [
    // Hunt entries
    ['I sounded the Hunter\'s Horn and was successful in the hunt!', ''],
    ['where I was successful in my hunt! I', 'and'],
    ['I went on a hunt with', 'I hunted with'],
    [/\d+? oz. /i, ''],
    [/\d+? lb. /i, ''],
    [/from (\d+?) x/i, 'from $1'],
    [/purchased (\d+?) x/i, 'purchased $1'],
    ['<br><b>The mouse also dropped the following loot:</b>', '==DROPREPLACE=='],
    ['.<br>==DROPREPLACE==<br>', ' that dropped '],
    ['<br>==DROPREPLACE==<br>', ' that dropped '],
    ['I caught an', 'I caught a'],
    ['I caught a', '<p>I caught a'],
    ['found that I had caught a mouse! I', ''],
    ['found that I had caught a mouse! <p>I', ''],
    ['I checked my trap and caught', 'I checked my trap and found'],
    ['I returned to check my trap, but it appeared', 'I checked my trap, but'],

    ['was successful in the hunt! I', ''],
    ['where I was successful in my hunt! I', 'and'],
    ['my efforts were fruitless. A', 'a'],
    ['got <font', 'was <font'],
    ['trap.<br><br>Additionally, the fiend pillaged', 'trap, and stealing'],
    ['gold from me!', 'gold.'],
    ['trap.<br><br>Additionally, the power of this mouse crippled my courage, setting me back', 'trap and I lost'],

    // Map entries
    ['I successfully completed ', 'Completing '],
    ['! Everyone who helped has been rewarded with', ' gave me'],
    [' each!', ', I can '],
    ['claim my reward', 'claim the reward.'],
    ['now!', ''],
    [', ending the hunt!', '.'],
    ['View Map Summary', ''],

    // Other
    ['I should hunt and catch a Relic Hunter or visit a Cartographer to obtain a new Treasure Map!', ''],
    ['hunt and catch a Relic Hunter or ', 'I can '],
    ['Treasure Map!', 'Treasure Map.'],
    [', causing my trap to glimmer with a magnificent shine', ''],
    [', causing my trap to sparkle with a fiendish glow', ''],
    [', causing my trap to spark with lightning', ''],
    ['!The', '! The'],
    ['(Local Time)', ''],
    ['and your item(s) have been', ''],
    [':</b><br>', '</b> '],
    [/<a href="receipt.php.+?view receipt<\/a>/i, ''],
    ['me:<br>', 'me '],
    [/i should tell my friends to check .+? during the next .+? to catch one!/i, ''],
    [/i can go to my .+? to open it/i, ''],
    ['Luckily she was not interested in my cheese or charms!', ''],
    ['while she was in my trap, but', 'and'],
    [' while scampering off!', ''],
    ['The mouse stole', ' The mouse stole'],
    ['Chest, I can', 'Chest, '],
    ['<br>I should ', 'I can '],
    ['<br>I can ', 'I can '],
    [' I replaced my bait since it seemed to be stale.', ''],
    ['*POP* Your Unstable Charm pops off your trap and has', 'My Unstable Charm'],
    ['You quickly add it to your inventory!', ''],
    ['I quickly added it to my inventory!', ''],
    [' burned out and left behind ', ' turned into '],
    [' a elusive ', ' a '],
    ['I moved forward a whopping', 'I moved forward'],
    ['!I', '! I'],
    ['in search of more loot', ''],
    ['or I can return to the', 'or return to the'],
    [' and begin a new expedition', ''],
    [' ate a piece of cheese without setting off my trap.', ' stole my cheese.'],
    ['slowly collapsed into itself with a powerful force, compressing mist in the air into an ', 'compressed mist in the air into an '],
    ['Your S.U.P.E.R. Scum Scrubber scrubbed the mouse clean and found ', 'My trap found an extra '],
    ['You scrubba-lubba-dub-dubbed your barrel and refined ', 'I refined '],
    ['an additional 1 ', 'an additional '],
    ['>.', '>'],
    [', and ', ' and '],
    ['!.,', '!'],
    ['My tower\'s ', 'My '],
    ['Energy Cannon', 'cannon'],
    ['before it could even touch my cheese!', ''],
    ['The mouse dropped the following prize', 'that dropped'],
    ['My Unstable Charm turned into', 'My Unstable Charm became'],
    ['•&nbsp;', ' '],
    ['My Condensed Creativity created additional loot:', 'My Condensed Creativity created an additional '],
    ['The mouse stole an Ancient Relic and dropped a Relic Hunter Scroll Case', 'The mouse stole an Ancient Relic and dropped a Relic Hunter Scroll Case!'],
    ['*BLING*', '<span class="decoration">✨️</span>'],
    ['Aura helped me find', 'Aura found'],
    ['processed  added', 'processed and added'],
    ['I have started a', 'I started a'],

    // Event stuff
    // SEH
    [/was.+chocolatonium.+trap!/i, ''],

    // Halloween
    [/an additional:<br>/i, 'an additional '],

    ['<br></p><p>', '<p>'],
    ['<br><p>', '<p>'],
    [/<p class="mhi-x-entry"> • /g, ''],
    [/(\d+?) x /gi, '<p class="mhi-x-entry"> • $1 x '],

    [/<p><\/p>/g, ''],
    ['I can view other recipe', '<p class="double">I can view other recipe'],
  ]);

  const replacements = [];

  const sehWords = [
    'chocoholic',
    'chocolate-crazed',
    'voracious',
    'gluttonous',
    'hypoglycemic',
    'ravenous',
    'greedy',
    'hungry',
    'hyperactive',
    'sugar-induced',
  ];

  sehWords.forEach((word) => {
    replacements.push([`A ${word}`, 'I caught a bonus']);
  });

  modifyText('.journal .entry.custom', replacements);

  // Update log
  const log = document.querySelector('.journal .content .log_summary');
  if (log) {
    const link = log.querySelector('td a');
    if (link) {
      link.classList.add('mh-ui-progress-log-link', 'mousehuntActionButton', 'tiny', 'lightBlue');
      const span = document.createElement('span');
      span.innerText = 'View Progress Log';
      link.innerText = '';
      link.append(span);
    }
  }

  const restoreEntries = document.querySelectorAll('.journal .entry[data-is-custom-entry]');
  restoreEntries.forEach((entry) => {
    maybeRestoreOriginalEntry(entry);
  });
};

const updateMouseImageLinks = () => {
  const mouseEntries = document.querySelectorAll('.journal .entry[data-mouse-type]');
  mouseEntries.forEach((entry) => {
    const mouseType = entry.getAttribute('data-mouse-type');
    const mouseImageLink = entry.querySelector('.journalimage a[onclick]');

    if (! (mouseType && mouseImageLink)) {
      return;
    }

    mouseImageLink.setAttribute('onclick', `hg.views.MouseView.show('${mouseType}'); return false;`);
  });
};

const kingsPromoTextChange = () => {
  const kingsPromo = document.querySelector('.shopsPage-kingsCalibratorPromo');
  if (kingsPromo) {
    kingsPromo.innerHTML = kingsPromo.innerHTML.replace('and even', 'and');
  }
};

const updateEls = () => {
  updateJournalText();
  updateMouseImageLinks();
};

/**
 * Initialize the module.
 */
const init = async () => {
  let stylesToAdd = [];

  if (getSetting('better-journal-styles', true)) {
    stylesToAdd = styles;
  } else {
    stylesToAdd.push(noStyles);
  }

  if (getSetting('better-journal-privacy')) {
    journalPrivacy();
  }

  if (getSetting('better-journal-replacements', true)) {
    updateEls();
    onRequest('*', () => {
      setTimeout(updateEls, 100);
      setTimeout(updateEls, 500);
    });
    onTurn(updateEls);
  }

  if (getSetting('better-journal-icons', getFlag('journal-icons-all', false))) {
    stylesToAdd.push(journalIconsMinimalStyles, journalIconsStyles);
  } else if (getSetting('better-journal-icons-minimal', getFlag('journal-icons', false))) {
    stylesToAdd.push(journalIconsMinimalStyles);
  }

  if (getSetting('better-journal-list', false)) {
    journalList();
  }

  addStyles(stylesToAdd, 'better-journal');

  onRequest('users/dailyreward.php', kingsPromoTextChange);
};

export default {
  id: 'better-journal',
  name: 'Better Journal',
  type: 'better',
  default: true,
  description: 'Modify the journal text, layout, and styling.',
  load: init,
  settings,
};
