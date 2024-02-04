import { addHudStyles, onRequest } from '@utils';
import folkloreForest from '../shared/folklore-forest';

import regionStyles from '../shared/folklore-forest/styles.css';
import styles from './styles.css';

/**
 * Add a disarmed class when bait is disarmed so that we can style the boat.
 */
const addDisarmedClass = () => {
  const hud = document.querySelector('#hudLocationContent');
  if (! hud) {
    return;
  }

  if (user.bait_disarmed) {
    hud.classList.add('disarmed');
  } else {
    hud.classList.remove('disarmed');
  }
};

/**
 * Make it so when the loot quantity is "70-70", it just says "70".
 */
const updatePondLootQuantity = () => {
  const lootMin = user?.quests?.QuestProloguePond?.current_loot_range?.min || 0;
  const lootMax = user?.quests?.QuestProloguePond?.current_loot_range?.max || 0;

  const lootMaxEl = document.querySelector('.prologuePondView-currentLoot-value-max');
  if (! lootMaxEl) {
    return;
  }

  if (lootMin === lootMax) {
    lootMaxEl.classList.add('hidden');
  } else {
    lootMaxEl.classList.remove('hidden');
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([regionStyles, styles]);

  folkloreForest();

  addDisarmedClass();
  onRequest(addDisarmedClass, 'managers/ajax/users/changetrap.php');

  updatePondLootQuantity();
  onRequest(updatePondLootQuantity, 'managers/ajax/environment/prologue_pond.php');
};
