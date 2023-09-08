import { addUIStyles } from '../utils';
import styles from './styles/styles.css';
import adventure from './styles/adventure.css';
import customEntries from './styles/custom-entries.css';
import fullstop from './styles/fullstop.css';
import miniEntries from './styles/mini-entries.css';
import progressLog from './styles/progress-log.css';

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
    // [/ worth \d.+? points and \d.+? gold/i, ''],
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

    // Event stuff
    // SEH
    [/was.+Chocolatonium.+trap!/i, ''],

    ['<p></p>', ''],
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

const updateKingsPromoText = () => {
  onRequest(kingsPromoTextChange, 'managers/ajax/users/dailyreward.php');
};

const main = () => {
  updateJournalText();
  updateMouseImageLinks();
  updateKingsPromoText();
};

export default function journal() {
  addUIStyles(styles);
  addUIStyles(adventure);
  addUIStyles(customEntries);
  addUIStyles(fullstop);
  addUIStyles(miniEntries);
  addUIStyles(progressLog);

  main();

  onRequest(() => {
    main();
    setTimeout(main, 300);
    setTimeout(main, 900);
  });
}
