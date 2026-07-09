import { onRequest } from '@utils';

import { randomizeAirship } from '../../../location-huds/shared/airship-randomizer';

/**
 * Initialize the module.
 */
const init = () => {
  // Equip a random look for every island.
  onRequest('environment/floating_islands.php', (response, data) => {
    if (
      'launch' === data?.action ||
      'launch_vault' === data?.action
    ) {
      randomizeAirship();
    }
  }, true);
};

/**
 * Module definition.
 */
export default {
  id: 'experiments.airship-randomizer',
  name: 'Floating Islands: Airship Randomizer',
  default: false,
  load: init,
};
