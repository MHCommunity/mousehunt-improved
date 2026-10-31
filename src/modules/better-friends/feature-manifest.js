import eggMaster from './modules/egg-master';
import emotes from './modules/emotes';
import friendNotes from './modules/friend-notes';
import friendsOnMaps from './modules/friends-on-maps';
import hoverProfiles from './modules/hover-profiles';
import scoreboardSearch from './modules/scoreboard-search';

const featureManifest = [
  { id: 'hover-profiles', setting: 'better-friends.hover-profiles', default: true, load: hoverProfiles },
  { id: 'emotes', setting: 'better-friends.emotes', default: true, load: emotes },
  { id: 'egg-master', setting: 'better-friends.egg-master', default: true, load: eggMaster },
  { id: 'friends-on-maps', setting: 'better-friends.friends-on-maps', default: false, load: friendsOnMaps },
  { id: 'friend-notes', setting: 'better-friends.friend-notes', default: true, load: friendNotes },
  { id: 'scoreboard-search', load: scoreboardSearch },
];

export default featureManifest;
