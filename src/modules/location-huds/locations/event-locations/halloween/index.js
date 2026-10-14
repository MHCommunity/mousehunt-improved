import { addHudStyles, onRequest } from '@utils';

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
  onRequest('*', unDisableCheese);
};

export { halloweenGlobal, halloweenLocation };
