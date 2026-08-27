const RAW_LOOT_INTRO_PHRASES = ['Inside, I found', 'Inside I found'];

const LOOT_INTRO_PHRASES = [
  'the following loot</b>',
  'Inside my chest was',
  ...RAW_LOOT_INTRO_PHRASES,
  'I found',
  'I found</b>',
  'Inside, I found</b>',
  'Loyalty Chest and received:',
  'I sifted through my Dragon Nest and found</b>',
  'I claimed a reward of</b>',
  "my Skyfarer's Oculus and discovered the following loot:",
  "my Skyfarer's Oculus and discovered:",
  'My golem returned from |*| with',
  'scared up an additional:',
  'the following bonus loot:',
  "knocked loose additional loot from the Sky Raiders' airships:",
  // Shortened form produced by the journal-replacements rule for the phrase
  // above; must come after it so the full phrase wins when replacements are off.
  'knocked loose',
];

export { LOOT_INTRO_PHRASES, RAW_LOOT_INTRO_PHRASES };
