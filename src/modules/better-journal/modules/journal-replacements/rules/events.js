import defineRules from './define';

export default defineRules('events', [
  [/was.+chocolatonium.+trap!/i, ''],
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
  ['Prize Pack!<br><br><b>', 'Prize Pack!<b>'],
  ['My Insidious Incense scared up an additional ', 'My Insidious Incense scared up an additional: '],
  ['I added a batch of ', 'I added '],
  ['into my brew queue for Cauldron', 'to the queue for Cauldron'],
  ['I finished brewing ', 'I brewed '],
  ['I also finished brewing ', 'I brewed '],
  ["My Boiling Cauldron Trap summoned additional arcane energy from my Alchemist's Cookbook Base and brewed", "My Boiling Cauldron Trap with my Alchemist's Cookbook Base brewed "],
  [
    'Hunting with Festive Spirit conjured 1 <a class="" title="" href="https://www.mousehuntgame.com/item.php?item_type=2014_throwable_snowball_stat_item" onclick="hg.views.ItemView.show(\'2014_throwable_snowball_stat_item\'); return false;">Throwable Snowball</a>',
    'My Festive Spirit made 1 <a class="" title="" href="https://www.mousehuntgame.com/item.php?item_type=2014_throwable_snowball_stat_item" onclick="hg.views.ItemView.show(\'2014_throwable_snowball_stat_item\'); return false;">Throwable Snowball</a>.',
  ],
]);
