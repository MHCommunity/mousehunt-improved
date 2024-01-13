import { debuglog } from '@utils';

import { birthdayGlobal, birthdayLocation } from './birthday';
import { greatWinterHuntGlobal, greatWinterHuntLocation } from './great-winter-hunt';
import { halloweenGlobal, halloweenLocation } from './halloween';
import { lunarNewYearGlobal } from './lunar-new-year';
import { springEggHuntGlobal } from './spring-egg-hunt';

export default async (location) => {
  switch (location) {
  case 'halloween_event_location':
    halloweenLocation();
    break;
  case 'winter_hunt_grove':
  case 'winter_hunt_workshop':
  case 'winter_hunt_fortress':
    greatWinterHuntLocation();
    break;
  case 'super_brie_factory':
    birthdayLocation();
    break;
  default:
    break;
  }

  const events = {
    0: [greatWinterHuntGlobal, lunarNewYearGlobal], // January.
    1: [birthdayGlobal], // February.
    2: [birthdayGlobal, springEggHuntGlobal], // March.
    3: [springEggHuntGlobal], // April.
    4: [], // May.
    5: [], // June.
    6: [], // July.
    7: [], // August.
    8: [], // September.
    9: [halloweenGlobal], // October.
    10: [halloweenGlobal, greatWinterHuntGlobal], // November.
    11: [greatWinterHuntGlobal], // December.
  };

  // No matter what, we want to load the global stuff, but only during the event.
  const date = new Date();
  const month = date.getMonth();

  debuglog('event-locations', `Loading ${events[month].length} global events for month ${month}.`);
  events[month].forEach((event) => {
    event();
  });
};
