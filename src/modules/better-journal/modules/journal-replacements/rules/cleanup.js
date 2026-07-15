import defineRules from './define';

export default defineRules('cleanup', [
  // The Relic Hunter rule rewrites her catch text to end in 'She', and the loot heading
  // rule rewrites the heading to ' that dropped '. Join them into a single readable
  // phrase — journal-list also splits its loot list on 'She dropped '.
  ['She that dropped', 'She dropped'],
  ['!The', '! The'],
  ['!I', '! I'],
  ['>.', '>'],
  ['!.,', '!'],
  [/<p><\/p>/g, ''],
  ['times.I can', 'times. I can'],
  ['pm .', 'pm.'],
  ['am .', 'am.'],
  ['oz.!', 'oz.'],
]);
