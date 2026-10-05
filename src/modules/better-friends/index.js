import { getSetting } from '@utils';

import settings from './settings';

import eggMaster from './modules/egg-master';
import emotes from './modules/emotes';
import friendsOnMaps from './modules/friends-on-maps';
import hoverProfiles from './modules/hover-profiles';
import scoreboardSearch from './modules/scoreboard-search';

const features = [
  { id: 'hover-profiles', default: true, load: hoverProfiles },
  { id: 'emotes', default: true, load: emotes },
  { id: 'egg-master', default: true, load: eggMaster },
  { id: 'friends-on-maps', default: false, load: friendsOnMaps },
  { id: 'scoreboard-search', load: scoreboardSearch },
];

/**
 * Initialize the module.
 */
const init = async () => {
  await Promise.all(features.filter((feature) => !('default' in feature) || getSetting(`better-friends.${feature.id}`, feature.default)).map(({ load }) => load()));
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-friends',
  name: 'Better Friends',
  type: 'friends-gifts',
  default: true,
  description: 'Add mini profiles on hover, corkboard emotes, scoreboard search on profiles, and more.',
  load: init,
  settings,
};
