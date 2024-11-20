import { addStyles, onJournalEntry } from '@utils';

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
  ['Poster!  The Marshall granted us our ', 'Poster gave me one '],
  [/ for turning in this lawless gang of the .+?\. time to find another <b>wanted poster<\/b>/i, ''],
  [' caught ', ' caught the final ', 'wanted_poster-complete'],

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
  ['My Condensed Creativity created additional loot:', 'My Condensed Creativity created an additional '],
  ['The mouse stole an Ancient Relic and dropped a Relic Hunter Scroll Case', 'The mouse stole an Ancient Relic and dropped a Relic Hunter Scroll Case!'],
  ['*BLING*', '<span class="decoration"></span>'],
  ['Aura helped me find', 'Aura found'],
  ['processed  added', 'processed and added'],
  ['I have started a', 'I started a'],
  [/an additional:<br>/i, 'an additional '],
  ['<br></p><p>', '<p>'],
  ['<br><p>', '<p>'],
  [/<p class="mhi-x-entry"><span class="dot"> • <\/span>/g, '', '!shop_purchase'],
  [/(\d+?) x /gi, '<p class="mhi-x-entry"><span class="dot"> • </span>$1 x ', '!shop_purchase'],
  ['My Condensed Creativity created an additional ', 'My Condensed Creativity created an additional: '],
  [/<p><\/p>/g, ''],
  ['I can view other recipe', '<p class="double">I can view other recipe'],
  ['Here is the loot summary from my infiltration of', 'I looted the following from'],
  ['Trove. and received', 'Trove and received'],
  ['Lucky me, a prize mouse wandered by and fell for my trap!', 'A prize mouse fell into my trap!'],
  [/(\d+?,?\d*?) x /gi, ' $1 ', 'shop_purchase'],
  ['In a flash of light my', 'My'],
  ['Chrome Dragon Slayer Cannon</a> found an additional ', 'Chome Dragon Slayer Cannon</a> found a '],
  ['Dragon Slayer Cannon</a> found an additional ', 'Dragon Slayer Cannon</a> found an extra '],
  ['I opened my harvest bin and retrieved the following yield: <br><br>From ', 'I opened my harvest bin and retrieved the following yield from '],
  ['My Slayer Aura found 1 extra ', 'My Slayer Aura found an extra '],
  ['Inside, I found', 'I found'],
  ['Inside I found', 'I found'],
  [/i earned some extra loot:<br>• (\d+?) <(.+?)>enerchi<\/a> from my (.+?)<br>/i, 'My $3 gave me an additional $1<a href="https://www.mousehuntgame.com/item.php?item_type=combat_energy_stat_item" onclick="hg.views.ItemView.show(\'combat_energy_stat_item\'); return false;">Enerchi</a>.'],
  ['my Skyfarer\'s Oculus and discovered the following loot:', 'my Skyfarer\'s Oculus and discovered: '],
  ['focussed the light from my ', 'focused the light from my '],
  ['Queso Cannonstorm Base</a> blasted 5 <a class="" title="" href="https://www.mousehuntgame.com/item.php?item_type=amber_queso_stat_item" onclick="hg.views.ItemView.show(\'amber_queso_stat_item\'); return false;">Solidified Amber Queso</a> to smithereens, revealing', 'Queso Cannonstorm Base</a> revealed'],
  ['Queso Cannonstorm Base</a> blasted 5 <a class="" title="" href="https://www.mousehuntgame.com/item.php?item_type=amber_queso_stat_item" onclick="hg.views.ItemView.show(\'amber_queso_stat_item\'); return false;">Solidified Amber Queso</a> but nothing was found', 'Queso Cannonstorm Base</a> revealed nothing'],
  ['within the rubble!', ''],
  ['shatter brilliantly! I have', 'shatter brilliantly! <p>I have'],
  ['I used a Master Magus Wand to DOUBLE my Spell Force which caused it to shatter brilliantly!', 'I used a Master Magus Wand to double my Spell Force! It shattered in a brilliant explosion of light!'],
  ['times.I can', 'times. I can'],
  ['Here is the summary of loot that I earned during my studies:<br><br>', 'I earned the following loot during my studies:'],
  ['The aura will last until', 'The aura expires on'],
  ['pm .', 'pm.'], // aura expiration fix.
  ['am .', 'am.'],

  // Event stuff
  // SEH
  [/was.+chocolatonium.+trap!/i, ''],

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
  ['Eggstra Fondue extracted', 'My Eggstra Fondue extracted'],
  ['Additionally my Eggstra Fondue also extracted', 'And'],

  // KGA.
  ['Prize Pack!<br><br><b>', 'Prize Pack!<b>'],

  // halloween.
  ['My Insidious Incense scared up an additional ', 'My Insidious Incense scared up an additional: '],
];

/**
 * Replace text in a journal entry.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const replaceInEntry = (entry) => {
  if (entry.getAttribute('data-replaced')) {
    return;
  }

  const element = entry.querySelector('.journalbody .journaltext');
  const startingText = element.innerHTML;
  let oldText = startingText;

  replacements.forEach(async (replacement) => {
    // If we have bad data, skip it.
    if (! Array.isArray(replacement) || replacement.length < 2) {
      return;
    }

    // If the replacement has a length of 3, we have a class we either want to skip or match.
    if (replacement.length === 3) {
      // If it has a !, we want to skip it, otherwise we want to match it.
      if (replacement[2].includes('!')) {
        if (entry.classList.contains(replacement[2].replace('!', ''))) {
          return;
        }
      } else if (! entry.classList.contains(replacement[2])) {
        return;
      }
    }

    const newText = oldText.replace(replacement[0], replacement[1]);
    if (oldText !== newText) {
      element.innerHTML = newText;
      oldText = newText;
    }
  });

  entry.setAttribute('data-replaced', 'true');
};

/**
 * Update the progress log link.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const updateLog = (entry) => {
  if (! entry.classList.contains('log_summary')) {
    return;
  }

  const link = entry.querySelector('td a');
  if (! link) {
    return;
  }

  link.classList.add('mh-ui-progress-log-link', 'mousehuntActionButton', 'small', 'lightBlue');

  const span = document.createElement('span');
  span.innerText = 'View Progress Log';
  link.innerText = '';
  link.append(span);
};

/**
 * Update the mouse image links.
 *
 * @param {HTMLElement} entry The journal entry.
 */
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

/**
 * Update the item links.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const updateItemLinks = (entry) => {
  if (! entry.classList.contains('iceberg_defeated')) {
    return;
  }

  const itemLinks = entry.querySelectorAll('.journaltext a[href*="item.php"]');
  if (itemLinks) {
    itemLinks.forEach((link) => {
      const itemType = link.href.match(/item\.php\?item_type=(\w+)/);
      if (itemType && itemType.length === 2) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          hg.views.ItemView.show(itemType[1]);
        });
      }
    });
  }

  const itemLinksNoHref = entry.querySelectorAll('.journaltext a[onclick]');
  if (itemLinksNoHref) {
    itemLinksNoHref.forEach((link) => {
      if ('#' !== link.getAttribute('href')) {
        return;
      }

      const itemType = link.getAttribute('onclick').match(/hg\.views\.ItemView\.show\('(\w+)'\)/);
      if (itemType && itemType.length === 2) {
        link.setAttribute('href', `https://www.mousehuntgame.com/item.php?item_type=${itemType[1]}`);
      }
    });
  }
};

/**
 * Check if we should skip an entry.
 *
 * @param {HTMLElement} entry The journal entry.
 *
 * @return {boolean} Whether to skip the entry.
 */
const shouldSkip = (entry) => {
  const keepOriginalClasses = new Set([
    'lunar_lantern',
    'valentines_matchmaker',
    'vending_machine_purchase',
    'fullyExplored',
    'folkloreForest-bookClaimed',
    'claimBooty',
  ]);

  if (! entry.classList) {
    return true;
  }

  const classList = [...entry.classList];
  return (classList.some((c) => keepOriginalClasses.has(c)));
};

/**
 * Process a journal entry.
 *
 * @param {HTMLElement} entry The journal entry.
 */
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

  onJournalEntry(processEntry, 500);
};
