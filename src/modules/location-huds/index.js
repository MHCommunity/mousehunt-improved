// Location HUD improvements.
import {
  addStyles,
  debuglog,
  getCurrentLocation,
  getSetting,
  onEvent,
  onNavigation,
  onRequest,
  removeHudStyles
} from '@utils';

import addToggleIcon from './toggle-icon';
import settings from './settings';

import styles from './styles.css';

// Locations
/* eslint-disable camelcase */
import acolyte_realm from './locations/acolyte-realm';
import ancient_city from './locations/ancient-city';
import balacks_cove from './locations/balacks-cove';
import bazaar from './locations/bazaar';
import bountiful_beanstalk from './locations/bountiful-beanstalk';
import calm_clearing from './locations/calm-clearing';
import cape_clawed from './locations/cape-clawed';
import catacombs from './locations/catacombs';
import clawshot_city from './locations/claw-shot-city';
import derr_dunes from './locations/derr-dunes';
import desert_city from './locations/desert-city'; // Muridae Market.
import desert_warpath from './locations/desert-warpath'; // Fiery Warpath.
import dojo from './locations/dojo';
import dracano from './locations/dracano';
import elub_shore from './locations/elub-shore';
import floating_islands from './locations/floating-islands';
import forbidden_grove from './locations/forbidden-grove';
import foreword_farm from './locations/foreword-farm';
import fort_rox from './locations/fort-rox';
import fungal_cavern from './locations/fungal-cavern';
import great_gnarled_tree from './locations/great-gnarled-tree';
import harbour from './locations/harbour';
import iceberg from './locations/iceberg';
import jungle_of_dread from './locations/jungle-of-dread';
import kings_arms from './locations/kings-arms';
import kings_gauntlet from './locations/kings-gauntlet';
import laboratory from './locations/laboratory';
import labyrinth from './locations/labyrinth';
import lagoon from './locations/lagoon';
import meditation_room from './locations/meditation-room';
import mountain from './locations/mountain';
import mousoleum from './locations/mousoleum';
import moussu_picchu from './locations/moussu-picchu';
import nerg_plains from './locations/nerg-plains';
import pinnacle_chamber from './locations/pinnacle-chamber';
import pollution_outbreak from './locations/pollution-outbreak'; // Toxic Spill.
import prologue_pond from './locations/prologue-pond';
import rift_bristle_woods from './locations/rift-bristle-woods';
import rift_burroughs from './locations/rift-burroughs';
import rift_furoma from './locations/rift-furoma';
import rift_gnawnia from './locations/rift-gnawnia';
import rift_valour from './locations/rift-valour';
import rift_whisker_woods from './locations/rift-whisker-woods';
import school_of_sorcery from './locations/school-of-sorcery';
import seasonal_garden from './locations/seasonal-garden';
import slushy_shoreline from './locations/slushy-shoreline';
import ss_huntington_ii from './locations/ss-huntington-ii';
import sunken_city from './locations/sunken-city';
import table_of_contents from './locations/table-of-contents';
import tournament_hall from './locations/tournament-hall';
import town_of_digby from './locations/town-of-digby';
import town_of_gnawnia from './locations/town-of-gnawnia';
import train_station from './locations/train-station';
import windmill from './locations/windmill';
import zugzwang_tower from './locations/zugzwang-tower';
/* eslint-enable camelcase */

// Regions
import regionLivingGarden from './locations/region-living-garden';
import regionQueso from './locations/region-queso';

// Events
import eventLocations from './locations/event-locations';

const regionMapping = [
  {
    region: 'region-living-garden',
    locations: ['desert_oasis', 'lost_city', 'sand_dunes'],
  },
  {
    region: 'region-queso',
    locations: ['queso_geyser', 'queso_plains', 'queso_quarry', 'queso_river'],
  },
  {
    region: 'event-locations',
    locations: [
      'halloween_event_location',
      'winter_hunt_workshop',
      'winter_hunt_fortress',
      'great_winter_taiga',
    ],
  },
];

/**
 * Standardize the location name.
 *
 * @param {string} location The location name.
 *
 * @return {string} The normalized location name.
 */
const normalizeCurrentLocation = (location) => {
  const region = regionMapping.find((regionMap) => regionMap.locations.includes(location));
  if (region) {
    return region.region;
  }

  return location;
};

/**
 * Main function.
 */
const main = () => {
  removeHudStyles();

  const currentLocation = getCurrentLocation();
  const location = normalizeCurrentLocation(currentLocation);

  debuglog('location-huds', `Location: ${location}`);

  if (getSetting('location-huds-enabled.event-locations', true)) {
    eventLocations(currentLocation);
  }

  if (! getSetting(`location-huds-enabled.${location}`, true)) {
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
    harbour,
    iceberg,
    jungle_of_dread,
    kings_arms,
    kings_gauntlet,
    laboratory,
    labyrinth,
    lagoon,
    meditation_room,
    mountain,
    mousoleum,
    moussu_picchu,
    nerg_plains,
    pinnacle_chamber,
    pollution_outbreak,
    prologue_pond,
    rift_bristle_woods,
    rift_burroughs,
    rift_furoma,
    rift_gnawnia,
    rift_valour,
    rift_whisker_woods,
    school_of_sorcery,
    seasonal_garden,
    slushy_shoreline,
    ss_huntington_ii,
    sunken_city,
    table_of_contents,
    tournament_hall,
    town_of_digby,
    town_of_gnawnia,
    train_station,
    windmill,
    zugzwang_tower,
    'region-living-garden': regionLivingGarden,
    'region-queso': regionQueso,
  };
  /* eslint-enable camelcase */

  if (locationHandlers[location]) {
    locationHandlers[location]();
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'location-huds');

  if (getSetting('experiments.location-hud-toggle')) {
    addToggleIcon();
  }

  onNavigation(main);
  onEvent('travel_complete', () => {
    setTimeout(main, 1000);
  });

  // Going to Zokor from Labyrinth and vice versa doesn't trigger a navigation event.
  onRequest('environment/labyrinth.php', (data, request) => {
    if ('make_intersection_choice' === request.action) {
      setTimeout(main, 1000);
    }
  });

  onRequest('environment/ancient_city.php', (data, request) => {
    if ('retreat' === request.action) {
      setTimeout(main, 1000);
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'location-huds',
  type: 'location-hud',
  alwaysLoad: true,
  load: init,
  settings,
};
