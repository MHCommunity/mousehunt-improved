import defineRules from './define';

export default defineRules('cleanup', [
  ['!The', '! The'],
  ['!I', '! I'],
  ['>.', '>'],
  ['!.,', '!'],
  [/<p><\/p>/, ''],
  ['times.I can', 'times. I can'],
  ['pm .', 'pm.'],
  ['am .', 'am.'],
  ['oz.!', 'oz.'],
]);
