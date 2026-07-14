import defineRules from './define';

export default defineRules('maps', [
  ['I successfully completed ', 'Completing '],
  ['! Everyone who helped has been rewarded with', ' gave me'],
  [' each!', ', I can '],
  ['claim my reward', 'claim the reward.'],
  ['now!', ''],
  [', ending the hunt!', '.'],
  ['View Map Summary', ''],
  ['Poster!  The Marshall granted us our ', 'Poster gave me one '],
  [/ for turning in this lawless gang of the .+?\. time to find another <b>wanted poster<\/b>/i, ''],
  [' caught ', ' caught the final ', { classes: ['wanted_poster-complete'] }],
]);
