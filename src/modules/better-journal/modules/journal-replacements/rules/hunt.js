import defineRules from './define';

export default defineRules('hunt', [
  ["I sounded the Hunter's Horn and was successful in the hunt!", ''],
  ['where I was successful in my hunt! I', 'and'],
  ['I went on a hunt with', 'I hunted with'],
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
