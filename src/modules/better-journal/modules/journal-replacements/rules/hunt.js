import defineRules from './define';

import { articleFor } from '../articles';

export default defineRules('hunt', [
  ["I sounded the Hunter's Horn and was successful in the hunt!", ''],
  ['where I was successful in my hunt! I', 'and'],
  ['I went on a hunt with', 'I hunted with'],
  // The article agrees with the weight ("an 8 oz. Captain Crook"), so stripping the
  // weight has to re-match it to the mouse name that follows.
  [
    /\b(an?) \d+ (?:lb\. \d+ oz\.|(?:oz|lb)\.) ((?:<[^>]*>)*)([a-z][\w'-]*)/gi,
    /**
     * Strip the weight and correct the article for the mouse name.
     *
     * @param {string} match   The full match.
     * @param {string} article The original article.
     * @param {string} tags    Any markup between the weight and the name.
     * @param {string} word    The first word of the mouse name.
     *
     * @return {string} The corrected article and name start.
     */
    (match, article, tags, word) => {
      const fixed = articleFor(word);
      return `${'A' === article[0] ? fixed[0].toUpperCase() + fixed.slice(1) : fixed} ${tags}${word}`;
    },
  ],
  [/\d+? oz. /i, ''],
  [/\d+? lb. /i, ''],
  [/from (\d+?) x/i, 'from $1'],
  [/purchased (\d+?) x/i, 'purchased $1'],
  [
    /(?:\.?(?:<br>){1,2})?<b>the mouse also dropped the following loot:<\/b>(?:<br>){0,2}/i,
    ' that dropped ',
    // Relic Hunter catches carry relicHunter_catch rather than catchsuccessloot, and
    // still use this loot heading. The 'She that dropped' cleanup rule joins the two.
    { classes: ['catchsuccessloot', 'relicHunter_catch'] },
  ],
  ['I caught a', '<p>I caught a'],
  ['found that I had caught a mouse! I', ''],
  ['found that I had caught a mouse! <p>I', ''],
  ['I checked my trap and caught', 'I checked my trap and found'],
  ['I returned to check my trap, but it appeared', 'I checked my trap, but'],
  ['was successful in the hunt! I', ''],
  ['my efforts were fruitless. A', 'a'],
  ['got <font', 'was <font'],
  ['trap.<br><br>Additionally, the fiend pillaged', 'trap, and stealing'],
  ['gold from me!', 'gold.'],
  ['trap.<br><br>Additionally, the power of this mouse crippled my courage, setting me back', 'trap and I lost'],
]);
