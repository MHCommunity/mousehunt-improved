import styles from './styles.css';

/**
 * For each element matching the selector, find and replace strings.
 *
 * @param {string} selector Element selector.
 * @param {Array}  strings  Array of strings to replace.
 */
const modifyText = (selector, strings) => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    strings.forEach(string => {
      if (!Array.isArray(string) || string.length !== 2) {
        console.error('Invalid string', string);
        return;
      }

      const oldText = element.innerHTML;
      const newText = oldText.replace(string[0], string[1]);
      if (oldText !== newText) {
        element.innerHTML = newText;
      }
    });
  });
}

/**
 * For each element matching the selector, add a period to the last sentence.
 *
 * @param {string} selector Element selector.
 */
const addPeriodToLastSentence = (selector) => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    const oldText = element.innerHTML;
    let newText = oldText.replace(/([^.?!])$/, '$1.')
      .replace('</p>.', '.</p>')
      .replace('<br>.', '.')
      .replace('..', '.');

    if (oldText !== newText) {
      element.innerHTML = newText;
    }
  });
}

/**
 * Update text in journal entries.
 */
const updateJournalText = () => {
  modifyText('.journal .entry .journalbody .journaltext', [
    // Hunt entries
    ["I sounded the Hunter's Horn and was successful in the hunt!", ''],
    ['where I was successful in my hunt! I', 'and'],
    ['I went on a hunt with', 'I hunted with'],
    [/\d+? oz. /i, ''],
    [/\d+? lb. /i, ''],
    [/from (\d+?) x/i, 'from $1'],
    [/ worth \d.+? points and \d.+? gold/i, ''],
    ['<br><b>The mouse also dropped the following loot:</b>', '==DROPREPLACE=='],
    ['.<br>==DROPREPLACE==<br>', ' that dropped '],
    ['<br>==DROPREPLACE==<br>', ' that dropped '],
    ['I caught an', 'I caught a'],
    ['I caught a', '<p>I caught a'],
    ['found that I had caught a mouse! I', ''],
    ['found that I had caught a mouse! <p>I', ''],
    ['I checked my trap and caught', 'I checked my trap and found'],

    ['was successful in the hunt! I', ''],
    ['where I was successful in my hunt! I', 'and'],
    ['my efforts were fruitless. A', 'a'],
    ['got <font', 'was <font'],
    ['trap.<br><br>Additionally, the fiend pillaged', 'trap, and stealing'],
    ['gold from me!', 'gold.'],
    ['trap.<br><br>Additionally, the power of this mouse crippled my courage, setting me back', 'trap, and I lost'],

    // Map entries
    ['I successfully completed ', 'Completing '],
    ['! Everyone who helped has been rewarded with', ' gave me'],
    [' each!', ', I can '],
    ['<br><br>I should', ''],
    ['claim my reward', 'claim the reward.'],
    ['now!', ''],
    [', ending the hunt!', '.'],
    ['View Map Summary', ''],

    // Other
    ['I should hunt and catch a Relic Hunter or visit a Cartographer to obtain a new Treasure Map!', ''],
    [', causing my trap to glimmer with a magnificent shine', ''],
    [', causing my trap to sparkle with a fiendish glow', ''],
    [', causing my trap to spark with lightning', ''],
    ['!The', '! The'],
    ['(Local Time)', ''],
    ['and your item(s) have been', ''],
    [':</b><br>', '</b> '],
    [/<a href="receipt.php.+?View Receipt<\/a>/i, ''],
    ['me:<br>', 'me '],

    // Event stuff
    // SEH
    [/was.+Chocolatonium.+trap!/i, ''],

    ['<br><br>', '<br>'],
    ['<br><br>', '<br>'],
    ['<p></p>', ''],
  ]);

  const replacements = [];
  const sehWords = ['chocoholic', 'gluttonous', 'ravenous', 'hungry', 'hyperactive', 'sugar-induced' ];
  sehWords.forEach(word => {
    replacements.push([`A ${word}`, 'I caught a bonus']);
  });

  modifyText('.journal .entry.custom .journalbody .journaltext', replacements);

  addPeriodToLastSentence('.journal .entry .journalbody .journaltext');
}

export default function journal() {
  addStyles(styles);

  updateJournalText();
  onAjaxRequest(() => {
    updateJournalText();
    setTimeout(updateJournalText, 300);
    setTimeout(updateJournalText, 900);
  });
}
