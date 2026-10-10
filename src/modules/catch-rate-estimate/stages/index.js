/**
 * Stage detection for attraction rates.
 *
 * Attraction rates depend on a location's stage, and the two sources name stages differently:
 * - `data`: the api's mice-attraction-rates-by-location file, built from MH-Tools population
 *   CSVs. Stage names follow MH-Tools' CRE bookmarklet (src/bookmarklet/bm-cre.js).
 * - `live`: MHCT, via api.mouse.rip/mhct. Stage names follow MHCT's stagers
 *   (mh-helper-extension src/scripts/modules/stages/environments).
 *
 * Each environment has a stager, in a file named after its id, that returns the stage for both
 * sources:
 * - `data` and `live`: the stage. `null` means it can't be determined, and `undefined` that the
 *   source doesn't stage the location. A `live` stage can be an array when MHCT records the stage
 *   as an object, which the api splits into a row for each part.
 * - `isTwisted`: for the twisted locations, which share their environment id with the normal ones.
 * - `liveFloorMice`: mice MHCT spreads across a stage's floors (Valour Rift).
 */

import ancientCity from './ancient-city';
import afterwordAcres from './afterword-acres';
import balacksCove from './balacks-cove';
import bountifulBeanstalk from './bountiful-beanstalk';
import ceruleanSkyport from './cerulean-skyport';
import clawShotCity from './claw-shot-city';
import conclusionCliffs from './conclusion-cliffs';
import desertCity from './desert-city';
import desertOasis from './desert-oasis';
import desertWarpath from './desert-warpath';
import draconicDepths from './draconic-depths';
import epilogueFalls from './epilogue-falls';
import floatingIslands from './floating-islands';
import forbiddenGrove from './forbidden-grove';
import forewordFarm from './foreword-farm';
import fortRox from './fort-rox';
import fungalCavern from './fungal-cavern';
import harbour from './harbour';
import iceberg from './iceberg';
import kingsGauntlet from './kings-gauntlet';
import labyrinth from './labyrinth';
import lostCity from './lost-city';
import mousoleum from './mousoleum';
import moussuPicchu from './moussu-picchu';
import pollutionOutbreak from './pollution-outbreak';
import quesoGeyser from './queso-geyser';
import riftBristleWoods from './rift-bristle-woods';
import riftBurroughs from './rift-burroughs';
import riftFuroma from './rift-furoma';
import riftValour from './rift-valour';
import riftWhiskerWoods from './rift-whisker-woods';
import sandDunes from './sand-dunes';
import schoolOfSorcery from './school-of-sorcery';
import seasonalGarden from './seasonal-garden';
import slushyShoreline from './slushy-shoreline';
import sunkenCity from './sunken-city';
import superBrieFactory from './super-brie-factory';
import tableOfContents from './table-of-contents';
import trainStation from './train-station';
import winterHuntFortress from './winter-hunt-fortress';
import zugzwangTower from './zugzwang-tower';

const stagers = {
  afterword_acres: afterwordAcres,
  ancient_city: ancientCity,
  balacks_cove: balacksCove,
  bountiful_beanstalk: bountifulBeanstalk,
  cerulean_skyport: ceruleanSkyport,
  claw_shot_city: clawShotCity,
  conclusion_cliffs: conclusionCliffs,
  desert_city: desertCity,
  desert_oasis: desertOasis,
  desert_warpath: desertWarpath,
  draconic_depths: draconicDepths,
  epilogue_falls: epilogueFalls,
  floating_islands: floatingIslands,
  forbidden_grove: forbiddenGrove,
  foreword_farm: forewordFarm,
  fort_rox: fortRox,
  fungal_cavern: fungalCavern,
  harbour,
  iceberg,
  kings_gauntlet: kingsGauntlet,
  labyrinth,
  lost_city: lostCity,
  mousoleum,
  moussu_picchu: moussuPicchu,
  pollution_outbreak: pollutionOutbreak,
  queso_geyser: quesoGeyser,
  rift_bristle_woods: riftBristleWoods,
  rift_burroughs: riftBurroughs,
  rift_furoma: riftFuroma,
  rift_valour: riftValour,
  rift_whisker_woods: riftWhiskerWoods,
  sand_dunes: sandDunes,
  school_of_sorcery: schoolOfSorcery,
  seasonal_garden: seasonalGarden,
  slushy_shoreline: slushyShoreline,
  sunken_city: sunkenCity,
  super_brie_factory: superBrieFactory,
  table_of_contents: tableOfContents,
  train_station: trainStation,
  winter_hunt_fortress: winterHuntFortress,
  zugzwang_tower: zugzwangTower,
};

// The data's environment and MHCT's location for the twisted locations.
const twistedLocations = {
  desert_oasis: { dataEnvironment: 'twisted_garden', liveLocation: 'Twisted Garden' },
  lost_city: { dataEnvironment: 'cursed_city', liveLocation: 'Cursed City' },
  sand_dunes: { dataEnvironment: 'sand_crypts', liveLocation: 'Sand Crypts' },
};

/**
 * Get the current stage for both attraction rate sources.
 *
 * @return {Object} The stage, with the data's environment and MHCT's location to look it up in.
 */
const getStage = () => {
  const environment = user.environment_type;
  const stage = {
    dataEnvironment: environment,
    // MHCT's rates are keyed by location name.
    liveLocation: user.environment_name || '',
    data: '-',
    live: undefined,
    liveFloorMice: null,
  };

  const stager = stagers[environment];
  if (!stager) {
    return stage;
  }

  try {
    const result = stager({
      quests: user.quests || {},
      viewingAtts: user.viewing_atts || {},
      bait: user.bait_name,
      base: user.base_name,
      charm: user.trinket_name,
      charmId: Number(user.trinket_item_id),
    });

    stage.data = result.data;
    stage.live = result.live;
    stage.liveFloorMice = result.liveFloorMice ?? null;

    if (result.isTwisted) {
      Object.assign(stage, twistedLocations[environment]);
    }
  } catch {
    stage.data = null;
    stage.live = null;
  }

  return stage;
};

export { getStage };
