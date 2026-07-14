import { birthdayGlobal, birthdayLocation } from './birthday';
import { greatWinterHuntGlobal, greatWinterHuntLocation } from './great-winter-hunt';
import { halloweenGlobal, halloweenLocation } from './halloween';
import { ronzaGlobal, ronzaLocation } from './ronza';
import { lunarNewYearGlobal } from './lunar-new-year';
import { springEggHuntGlobal } from './spring-egg-hunt';

let initializedGlobalEvents = false;

const eventLocationIds = new Set([
  'halloween_event_location',
  'winter_hunt_grove',
  'winter_hunt_workshop',
  'winter_hunt_fortress',
  'super_brie_factory',
  'ronzas_traveling_shoppe',
]);

const isEventLocation = (location) => eventLocationIds.has(location);

/**
 * Activate behavior that only belongs to the current event location.
 *
 * @param {string} location The raw location id.
 */
const activateEventLocation = (location) => {
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
  case 'ronzas_traveling_shoppe':
    ronzaLocation();
    break;
  default:
    break;
  }
};

/**
 * Initialize seasonal behavior that remains active outside event locations.
 */
const initializeEventGlobals = () => {
  if (initializedGlobalEvents) {
    return;
  }

  initializedGlobalEvents = true;

  const events = {
    0: [greatWinterHuntGlobal, lunarNewYearGlobal], // January.
    1: [birthdayGlobal, lunarNewYearGlobal], // February.
    2: [birthdayGlobal, springEggHuntGlobal], // March.
    3: [springEggHuntGlobal], // April.
    4: [], // May.
    5: [], // June.
    6: [ronzaGlobal], // July.
    7: [ronzaGlobal], // August.
    8: [], // September.
    9: [halloweenGlobal], // October.
    10: [halloweenGlobal, greatWinterHuntGlobal], // November.
    11: [greatWinterHuntGlobal], // December.
  };

  // No matter what, we want to load the global stuff, but only during the event.
  const month = new Date().getMonth();

  events[month].forEach((event) => {
    event();
  });
};

export {
  activateEventLocation,
  initializeEventGlobals,
  isEventLocation
};
