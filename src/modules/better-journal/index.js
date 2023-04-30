import { addUIStyles } from '../utils';
import styles from './styles.css';

/**
 * For each element matching the selector, find and replace strings.
 *
 * @param {string} selector Element selector.
 * @param {Array}  strings  Array of strings to replace.
 */
const modifyText = (selector, strings) => {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    strings.forEach((string) => {
      if (! Array.isArray(string) || string.length !== 2) {
        return;
      }

      const oldText = element.innerHTML;
      const newText = oldText.replace(string[0], string[1]);
      if (oldText !== newText) {
        element.innerHTML = newText;
      }
    });
  });
};

const addFullStopToJournalEntries = () => {
  let journalEntries = [];
  const huntEntries = document.querySelectorAll('.journal .entry .journaltext p:last-child');
  if (huntEntries.length > 0) {
    // add all the nodes to the array
    journalEntries = journalEntries.concat(Array.from(huntEntries));
  }

  const trapCheckEntries = document.querySelectorAll('.journal .entry.passive .journaltext');
  if (trapCheckEntries.length > 0) {
    // add all these nodes to the array as well
    journalEntries = journalEntries.concat(Array.from(trapCheckEntries));
  }

  journalEntries.forEach((entry) => {
    const text = entry.innerHTML;
    if (! text.endsWith('.') || text.endsWith('!')) {
      entry.innerHTML = `${text}.`;
    } else if (text.endsWith('</p>')) {
      entry.innerHTML = `${text.slice(0, -4)}.<p>`;
    }
  });
};

/**
 * Update text in journal entries.
 */
const updateJournalText = () => {
  modifyText('.journal .entry .journalbody .journaltext', [
    // Hunt entries
    ['I sounded the Hunter\'s Horn and was successful in the hunt!', ''],
    ['where I was successful in my hunt! I', 'and'],
    ['I went on a hunt with', 'I hunted with'],
    [/\d+? oz. /i, ''],
    [/\d+? lb. /i, ''],
    [/from (\d+?) x/i, 'from $1'],
    [/purchased (\d+?) x/i, 'purchased $1'],
    [/ worth \d.+? points and \d.+? gold/i, ''],
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
    [/<a href="receipt.php.+?View Receipt<\/a>/i, ''],
    ['me:<br>', 'me '],
    [/I should tell my friends to check .+? during the next .+? to catch one!/i, ''],
    [/I can go to my .+? to open it/i, ''],
    ['Luckily she was not interested in my cheese or charms!', ''],
    ['while she was in my trap, but', 'and'],
    [' while scampering off!', ''],
    ['dropped a Relic Hunter Scroll Case', 'dropped a Relic Hunter Scroll Case.'],
    ['The mouse stole', ' The mouse stole'],
    ['Chest, I can', 'Chest, '],
    ['<br>I should ', 'I can '],
    ['<br>I can ', 'I can '],
    [' I replaced my bait since it seemed to be stale.', ''],
    ['*POP* Your Unstable Charm pops off your trap and has', 'Your Unstable Charm'],
    ['You quickly add it to your inventory!', ''],
    [' a elusive ', ' a '],
    ['I moved forward a whopping', 'I moved forward'],
    ['!I', '! I'],
    ['in search of more loot', ''],
    ['or I can return to the', 'or return to the'],
    [' and begin a new expedition', ''],

    // Event stuff
    // SEH
    [/was.+Chocolatonium.+trap!/i, ''],
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

  modifyText('.journal .entry.custom .journalbody .journaltext', replacements);

  const entries = document.querySelectorAll('.journal .entry .journaltext p');
  entries.forEach((entry) => {
    // if the innerhtml is empty, remove the p tag
    if (entry.innerHTML.trim() === '') {
      entry.remove();
    }
  });

  // Update log
  const log = document.querySelector('.journal .content .log_summary');
  if (log) {
    const link = log.querySelector('td a');
    if (link) {
      link.classList.add('mh-ui-progress-log-link', 'mousehuntActionButton', 'tiny', 'lightBlue');
      const span = document.createElement('span');
      span.innerText = 'View Progress Log';
      link.innerText = '';
      link.appendChild(span);
    }
  }

  addFullStopToJournalEntries();

  eventRegistry.doEvent('journal_replacements_finished');
};

export default function journal() {
  addUIStyles(styles);

  updateJournalText();
  onAjaxRequest(() => {
    updateJournalText();
    setTimeout(updateJournalText, 300);
    setTimeout(updateJournalText, 900);
  });
}
