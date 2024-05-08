// Location HUD improvements.
import {
  addStyles,
  debuglog,
  getCurrentLocation,
  getSetting,
  onEvent,
  onNavigation,
  removeHudStyles
} from '@utils';

import addToggleIcon from './toggle-icon';
import settings from './settings';

import styles from './styles.css';

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
import harbour from './harbour';
import iceberg from './iceberg';
import jungle_of_dread from './jungle-of-dread';
import kings_arms from './kings-arms';
import kings_gauntlet from './kings-gauntlet';
import laboratory from './laboratory';
import labyrinth from './labyrinth';
import lagoon from './lagoon';
import meditation_room from './meditation-room';
import mountain from './mountain';
import mousoleum from './mousoleum';
import moussu_picchu from './moussu-picchu';
import nerg_plains from './nerg-plains';
import pinnacle_chamber from './pinnacle-chamber';
import pollution_outbreak from './pollution-outbreak'; // Toxic Spill.
import prologue_pond from './prologue-pond';
import rift_bristle_woods from './rift-bristle-woods';
import rift_burroughs from './rift-burroughs';
import rift_furoma from './rift-furoma';
import rift_gnawnia from './rift-gnawnia';
import rift_valour from './rift-valour';
import rift_whisker_woods from './rift-whisker-woods';
import school_of_sorcery from './school-of-sorcery';
import seasonal_garden from './seasonal-garden';
import slushy_shoreline from './slushy-shoreline';
import ss_huntington_ii from './ss-huntington-ii';
import sunken_city from './sunken-city';
import table_of_contents from './table-of-contents';
import tournament_hall from './tournament-hall';
import town_of_digby from './town-of-digby';
import town_of_gnawnia from './town-of-gnawnia';
import train_station from './train-station';
import windmill from './windmill';
import zugzwang_tower from './zugzwang-tower';
/* eslint-enable camelcase */

// Regions
import regionLivingGarden from './region-living-garden';
import regionQueso from './region-queso';

// Events
import eventLocations from './event-locations';

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

const normalizeCurrentLocation = (location) => {
  const region = regionMapping.find((regionMap) => regionMap.locations.includes(location));
  if (region) {
    return region.region;
  }

  return location;
};

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
};

export default {
  id: 'location-huds',
  type: 'location-hud',
  alwaysLoad: true,
  load: init,
  settings,
};
