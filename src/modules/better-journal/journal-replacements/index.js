import { addEvent, addStyles } from '@utils';

import styles from './styles.css';

const replacements = [
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
  [/<p class="mhi-x-entry"><span class="dot"> • <\/span>/g, ''],
  [/(\d+?) x /gi, '<p class="mhi-x-entry"><span class="dot"> • </span>$1 x '],

  [/<p><\/p>/g, ''],
  ['I can view other recipe', '<p class="double">I can view other recipe'],

  // SEH.
  ['A chocoholic', 'I caught a bonus'],
  ['A chocolate-crazed', 'I caught a bonus'],
  ['A voracious', 'I caught a bonus'],
  ['A gluttonous', 'I caught a bonus'],
  ['A hypoglycemic', 'I caught a bonus'],
  ['A ravenous', 'I caught a bonus'],
  ['A greedy', 'I caught a bonus'],
  ['A hungry', 'I caught a bonus'],
  ['A hyperactive', 'I caught a bonus'],
  ['A sugar-induced', 'I caught a bonus'],

  ['Here is the loot summary from my infiltration of', 'I looted the following from']
];

const replaceInEntry = (entry) => {
  if (entry.getAttribute('data-replaced')) {
    return;
  }

  const element = entry.querySelector('.journalbody .journaltext');

  replacements.forEach(async (string) => {
    if (! Array.isArray(string) || string.length !== 2) {
      return;
    }

    const oldText = element.innerHTML;
    const newText = oldText.replace(string[0], string[1]);
    if (oldText !== newText) {
      element.innerHTML = newText;
    }
  });

  entry.setAttribute('data-replaced', 'true');
};

const updateLog = (entry) => {
  if (! entry.classList.contains('log_summary')) {
    return;
  }

  const link = entry.querySelector('td a');
  if (! link) {
    return;
  }

  link.classList.add('mh-ui-progress-log-link', 'mousehuntActionButton', 'tiny', 'lightBlue');

  const span = document.createElement('span');
  span.innerText = 'View Progress Log';
  link.innerText = '';
  link.append(span);
};

const updateMouseImageLinks = (entry) => {
  const mouseType = entry.getAttribute('data-mouse-type');
  if (! mouseType) {
    return;
  }

  const hasUpdated = entry.getAttribute('data-mouse-image-updated');
  if (hasUpdated) {
    return;
  }

  const mouseImageLink = entry.querySelector('.journalimage a[onclick]');
  if (! mouseImageLink) {
    return;
  }

  mouseImageLink.setAttribute('onclick', `hg.views.MouseView.show('${mouseType}'); return false;`);
  entry.setAttribute('data-mouse-image-updated', 'true');
};

const updateItemLinks = (entry) => {
  if (! entry.classList.contains('iceberg_defeated')) {
    return;
  }

  const itemLinks = entry.querySelectorAll('.journaltext a[href*="item.php"]');
  if (! itemLinks) {
    return;
  }

  itemLinks.forEach((link) => {
    const itemType = link.href.match(/item\.php\?item_type=(\w+)/);
    if (itemType && itemType.length === 2) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        hg.views.ItemView.show(itemType[1]);
      });
    }
  });
};

const shouldSkip = (entry) => {
  const keepOriginalClasses = new Set([
    'lunar_lantern',
    'valentines_matchmaker',
    'vending_machine_purchase',
  ]);

  if (! entry.classList) {
    return true;
  }

  const classList = [...entry.classList];
  return (classList.some((c) => keepOriginalClasses.has(c)));
};

const processEntry = async (entry) => {
  if (shouldSkip(entry)) {
    return;
  }

  replaceInEntry(entry);
  updateLog(entry);
  updateMouseImageLinks(entry);
  updateItemLinks(entry);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-replacements');

  addEvent('journal-entry', (entry) => {
    processEntry(entry);
    setTimeout(() => {
      processEntry(entry);
    }, 500);
  }, { weight: 1000, id: 'better-journal-replacements' });
};
