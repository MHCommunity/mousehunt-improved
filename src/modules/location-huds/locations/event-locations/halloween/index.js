import { addHudStyles, formatNumber, makeElement, onRequest } from '@utils';

import { spookyShuffleTracker } from './spooky-shuffle-tracker';

import styles from './styles.css';

/**
 * Remove the disabled class from the cheese.
 */
const unDisableCheese = () => {
  const armButtons = document.querySelectorAll('.halloweenBoilingCauldronHUD-bait');
  armButtons.forEach((armButton) => {
    armButton.classList.remove('disabled');
    const link = armButton.querySelector('a.disabled');
    if (link) {
      link.classList.remove('disabled');
    }

    const tooltipLink = armButton.querySelector('.halloweenBoilingCauldronHUD-bait-tooltipContent a.disabled');
    if (tooltipLink) {
      tooltipLink.classList.remove('disabled');
    }
  });
};

let shopReplaced = false;

/**
 * Close the HUD's item dialog when its "View Apothecary Shop" button opens the shop,
 * otherwise the dialog stays open on top of the shop popup.
 */
const closeDialogOnShopOpen = () => {
  const recipeView = hg?.views?.HalloweenBoilingCauldronRecipeView;
  if (shopReplaced || !recipeView?.showShop) {
    return;
  }

  shopReplaced = true;

  const _original = recipeView.showShop;

  /**
   * Replacement for the showShop function.
   *
   * @param {any} args Arguments passed to the original function.
   *
   * @return {any} The original function's return value.
   */
  recipeView.showShop = (...args) => {
    hg.views.HeadsUpDisplayHalloweenBoilingCauldronView?.hideDialog?.();
    return _original(...args);
  };
};

/**
 * Count the hunts it'll take to brew every queued batch and all the Mousedrake
 * Roots in the inventory into Evil Extract, spreading new batches across the
 * cauldrons as they free up.
 *
 * @param {Object} quest The QuestHalloweenBoilingCauldron data.
 *
 * @return {number} The number of hunts, or 0 if there's nothing to brew.
 */
const getRootBrewHunts = (quest) => {
  const recipe = Object.values(quest?.recipes?.cheese || {}).find((r) => 'halloween_extract_cauldron_recipe' === r.type);
  const rootCost = Number(recipe?.cost?.find((c) => 'cauldron_potion_ingredient_stat_item' === c.type)?.quantity || 0);
  const brewTime = Number(recipe?.brew_time || 0);
  const cauldrons = Object.values(quest?.cauldrons || {});
  if (!rootCost || !brewTime || !cauldrons.length) {
    return 0;
  }

  // Hunts each cauldron already has lined up: what's left of the current brew, plus its queue.
  const loads = cauldrons.map((cauldron) => {
    const current = cauldron.is_brewing ? Number(cauldron.brew_time || 0) : 0;
    const queued = (cauldron.queue || []).reduce((total, item) => total + Number(item.brew_time || 0), 0);
    return current + queued;
  });

  const roots = Number(quest?.items?.cauldron_potion_ingredient_stat_item?.quantity_unformatted || 0);
  const batches = Math.floor(roots / rootCost);
  for (let i = 0; i < batches; i++) {
    const next = loads.indexOf(Math.min(...loads));
    loads[next] += brewTime;
  }

  return Math.max(...loads);
};

/**
 * Show how many hunts the remaining roots will take to brew, under the shutdown notice.
 * Skipped once the final shutdown phase adds the Instant Alchemy Workbench in its spot.
 */
const addRootBrewEstimate = () => {
  const quest = user?.quests?.QuestHalloweenBoilingCauldron;
  const hud = document.querySelector('.halloweenBoilingCauldronHUD');
  const existing = hud?.querySelector('.mh-halloween-brew-estimate');

  const hasWorkbench = hud?.querySelector('.halloweenBoilingCauldronHUD-final-shutdown-convert-ingredients-button');
  const hunts = quest?.is_shutdown && !hasWorkbench ? getRootBrewHunts(quest) : 0;
  if (!hud || !hunts) {
    existing?.remove();
    return;
  }

  const estimate = existing || makeElement('div', 'mh-halloween-brew-estimate', '', hud);
  estimate.replaceChildren('Your roots will take ', makeElement('b', '', formatNumber(hunts)), ` ${1 === hunts ? 'hunt' : 'hunts'} to brew`);
};

/**
 * Always active.
 */
const halloweenGlobal = async () => {
  spookyShuffleTracker();
};

/**
 * Only active at the event location.
 */
const halloweenLocation = async () => {
  addHudStyles(styles);
  unDisableCheese();
  closeDialogOnShopOpen();
  addRootBrewEstimate();
  onRequest('*', () => {
    unDisableCheese();
    addRootBrewEstimate();
  });
};

export { halloweenGlobal, halloweenLocation };
