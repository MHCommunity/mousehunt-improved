// Location HUD improvements.
import { addUIStyles } from '../utils';

import balacksCove from './balacks-cove';
import brift from './brift';
import cheeseSelectors from './cheese-selectors';
import floatingIslands from './floating-islands';
import forbiddenGrove from './forbidden-grove';
import fortRox from './fort-rox';
import iceberg from './iceberg';
import labyrinth from './labyrinth';
import sunkenCity from './sunken-city';
import vrift from './vrift';

import balacksCoveStyles from './balacks-cove/styles.css';
import briftStyles from './brift/styles.css';
import bwriftStyles from './bwrift/styles.css';
import cheeseSelectorsStyles from './cheese-selectors/styles.css';
import clawShotCityStyles from './claw-shot-city/styles.css';
import fieryWarpathStyles from './fiery-warpath/styles.css';
import floatingIslandsStyles from './floating-islands/styles.css';
import forbiddenGroveStyles from './forbidden-grove/styles.css';
import fortRoxStyles from './fort-rox/styles.css';
import fungalCavernStyles from './fungal-cavern/styles.css';
import furomaRiftStyles from './furoma-rift/styles.css';
import gnawniaExpressStationStyles from './gnawnia-express-station/styles.css';
import icebergStyles from './iceberg/styles.css';
import livingGardenStyles from './living-garden/styles.css';
import labyrinthStyles from './labyrinth/styles.css';
import muridaeMarketStyles from './muridae-market/styles.css';
import quesoStyles from './queso/styles.css';
import sunkenCityStyles from './sunken-city/styles.css';
import toxicSpillStyles from './toxic-spill/styles.css';
import vriftStyles from './vrift/styles.css';
import wwriftStyles from './wwrift/styles.css';
import zokorStyles from './zokor/styles.css';

const main = () => {
  switch (getCurrentLocation()) {
  case 'balacks_cove':
    cheeseSelectors();
    balacksCove();
    break;
  case 'rift_burroughs':
    brift();
    break;
  case 'floating_islands':
    floatingIslands();
    break;
  case 'forbidden_grove':
    cheeseSelectors();
    forbiddenGrove();
    break;
  case 'fort_rox':
    fortRox();
    break;
  case 'iceberg':
    iceberg();
    break;
  case 'labyrinth':
    labyrinth();
    break;
  case 'rift_valour':
    vrift();
    break;
  case 'sunken_city':
    sunkenCity();
    break;
  case 'meadow':
  case 'kings_arms':
  case 'tournament_hall':
  case 'kings_gauntlet':
  case 'calm_clearing':
  case 'great_gnarled_tree':
  case 'lagoon':
  case 'bazaar':
  case 'town_of_digby':
  case 'training_grounds':
  case 'dojo':
  case 'meditation_room':
  case 'pinnacle_chamber':
  case 'catacombs':
  case 'cape_clawed':
  case 'elub_shore':
  case 'nerg_plains':
  case 'derr_dunes':
  case 'jungle_of_dread':
  case 'dracano':
  case 'ss_huntington_ii':
  case 'slushy_shoreline':
    cheeseSelectors();
    break;
  }
};

const getStyles = () => {
  return [
    balacksCoveStyles,
    briftStyles,
    bwriftStyles,
    cheeseSelectorsStyles,
    clawShotCityStyles,
    fieryWarpathStyles,
    floatingIslandsStyles,
    forbiddenGroveStyles,
    fortRoxStyles,
    fungalCavernStyles,
    furomaRiftStyles,
    gnawniaExpressStationStyles,
    icebergStyles,
    livingGardenStyles,
    labyrinthStyles,
    muridaeMarketStyles,
    quesoStyles,
    sunkenCityStyles,
    toxicSpillStyles,
    vriftStyles,
    wwriftStyles,
    zokorStyles,
  ].join('\n');
};

export default function locationHuds() {
  addUIStyles(getStyles());

  setTimeout(() => {
    main();
    onRequest(main);
    onPageChange({ camp: { show: main } });
    onTravel(null, { callback: main });
    onRequest(() => {
      setTimeout(main, 500);
    }, 'managers/ajax/turns/activeturn.php', true);
  }, 150);
}
