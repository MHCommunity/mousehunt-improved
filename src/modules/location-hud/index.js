// Location HUD improvements.
import {
  getCurrentLocation,
  getMhuiSetting,
  onNavigation,
  onTravel,
  removeHudStyles
} from '../utils';

// Locations
/* eslint-disable camelcase */
import acolyte_realm from './acolyte-realm';
import ancient_city from './ancient-city';
import balacks_cove from './balacks-cove';
import bazaar from './bazaar';
import bountiful_beanstalk from './bountiful-beanstalk';
import calm_clearing from './calm-clearing';
import cape_clawed from './cape-clawed';
import catacombs from './catacombs';
import clawshot_city from './claw-shot-city';
import derr_dunes from './derr-dunes';
import desert_city from './desert-city'; // Muridae Market.
import desert_warpath from './desert-warpath'; // Fiery Warpath.
import dojo from './dojo';
import dracano from './dracano';
import elub_shore from './elub-shore';
import floating_islands from './floating-islands';
import forbidden_grove from './forbidden-grove';
import foreword_farm from './foreword-farm';
import fort_rox from './fort-rox';
import fungal_cavern from './fungal-cavern';
import great_gnarled_tree from './great-gnarled-tree';
import halloween_event_location from './halloween-event-location';
import iceberg from './iceberg';
import jungle_of_dread from './jungle-of-dread';
import kings_arms from './kings-arms';
import kings_gauntlet from './kings-gauntlet';
import labyrinth from './labyrinth';
import lagoon from './lagoon';
import meditation_room from './meditation-room';
import moussu_picchu from './moussu-picchu';
import nerg_plains from './nerg-plains';
import pinnacle_chamber from './pinnacle-chamber';
import pollution_outbreak from './pollution-outbreak'; // Toxic Spill.
import rift_bristle_woods from './rift-bristle-woods';
import rift_burroughs from './rift-burroughs';
import rift_furoma from './rift-furoma';
import rift_gnawnia from './rift-gnawnia';
import rift_valour from './rift-valour';
import rift_whisker_woods from './rift-whisker-woods';
import slushy_shoreline from './slushy-shoreline';
import ss_huntington_ii from './ss-huntington-ii';
import sunken_city from './sunken-city';
import table_of_contents from './table-of-contents';
import tournament_hall from './tournament-hall';
import town_of_digby from './town-of-digby';
import train_station from './train-station';
import windmill from './windmill';
import zugzwang_tower from './zugzwang-tower';
/* eslint-enable camelcase */

// Regions
import regionLivingGarden from './region-living-garden';
import regionQueso from './region-queso';

const normalizeCurrentLocation = (location) => {
  const livingGardenRegions = [
    'desert_oasis',
    'lost_city',
    'sand_dunes',
  ];

  if (livingGardenRegions.includes(location)) {
    return 'region-living-garden';
  }

  const quesoRegions = [
    'queso_geyser',
    'queso_plains',
    'queso_quarry',
    'queso_river',
  ];

  if (quesoRegions.includes(location)) {
    return 'region-queso';
  }

  const eventLocations = [
    'halloween_event_location',
  ];

  if (eventLocations.includes(location)) {
    return 'event-locations';
  }

  return location;
};

const main = () => {
  removeHudStyles();

  const currentLocation = getCurrentLocation();
  const location = normalizeCurrentLocation(currentLocation);
  if (! getMhuiSetting(location, true)) {
    return;
  }

  /* eslint-disable camelcase */
  const locationHandlers = {
    acolyte_realm,
    ancient_city,
    balacks_cove,
    bazaar,
    bountiful_beanstalk,
    calm_clearing,
    cape_clawed,
    catacombs,
    clawshot_city,
    derr_dunes,
    desert_city,
    desert_warpath,
    dojo,
    dracano,
    elub_shore,
    floating_islands,
    forbidden_grove,
    foreword_farm,
    fort_rox,
    fungal_cavern,
    great_gnarled_tree,
    halloween_event_location,
    iceberg,
    jungle_of_dread,
    kings_arms,
    kings_gauntlet,
    labyrinth,
    lagoon,
    meditation_room,
    moussu_picchu,
    nerg_plains,
    pinnacle_chamber,
    pollution_outbreak,
    rift_bristle_woods,
    rift_burroughs,
    rift_furoma,
    rift_gnawnia,
    rift_valour,
    rift_whisker_woods,
    slushy_shoreline,
    ss_huntington_ii,
    sunken_city,
    table_of_contents,
    tournament_hall,
    town_of_digby,
    train_station,
    windmill,
    zugzwang_tower,
    'region-living-garden': regionLivingGarden,
    'region-queso': regionQueso,
    'event-locations': halloween_event_location, // TODO: move this to a 'event-locations' folder with other events.
  };
  /* eslint-enable camelcase */

  if (locationHandlers[location]) {
    locationHandlers[location]();
  }
};

const load = () => {
  // We want to run this basically all the time.
  onNavigation(main);
  onTravel(main);

  // Do it for every ajax request just in case, but specifically for the activeturn request.
  onRequest(main);
  onRequest(() => {
    setTimeout(main, 500);
  }, 'managers/ajax/turns/activeturn.php', true);
};

export default () => {
  addUIStyles(cheeseSelectorStyles);

  load();
  setTimeout(load, 500);
};
