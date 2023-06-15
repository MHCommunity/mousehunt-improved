// Location HUD improvements.
import { addUIStyles } from '../utils';

import balacksCove from './balacks-cove';
import brift from './brift';
import cheeseSelectors from './cheese-selectors';
import floatingIslands from './floating-islands';
import forbiddenGrove from './forbidden-grove';
import fortRox from './fortrox';
import iceberg from './iceberg';
import labyrinth from './labyrinth';
import vrift from './vrift';

import balacksCoveStyles from './balacks-cove/styles.css';
import briftStyles from './brift/styles.css';
import bwriftStyles from './bwrift/styles.css';
import cheeseSelectorsStyles from './cheese-selectors/styles.css';
import floatingIslandsStyles from './floating-islands/styles.css';
import forbiddenGroveStyles from './forbidden-grove/styles.css';
import fortRoxStyles from './fortrox/styles.css';
import icebergStyles from './iceberg/styles.css';
import labyrinthStyles from './labyrinth/styles.css';
import quesoStyles from './queso/styles.css';
import vriftStyles from './vrift/styles.css';

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
    floatingIslandsStyles,
    forbiddenGroveStyles,
    fortRoxStyles,
    icebergStyles,
    labyrinthStyles,
    quesoStyles,
    vriftStyles,
  ].join('\n');
};

export default function locationHuds() {
  main();
  onAjaxRequest(main);
  onPageChange({ camp: { show: main } });
  onTravel(null, { callback: main });
  onAjaxRequest(() => {
    setTimeout(main, 500);
  }, 'managers/ajax/turns/activeturn.php', true);

  addUIStyles(getStyles());
}
