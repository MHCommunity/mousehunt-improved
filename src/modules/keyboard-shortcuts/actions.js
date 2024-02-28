import {
  doEvent,
  doRequest,
  getCurrentLocation,
  getCurrentPage,
  setPage
} from '@utils';

/**
 * Click the min luck button.
 */
const clickMinLuck = () => {
  const minluckButton = document.querySelector('.min-luck-button');
  if (minluckButton) {
    minluckButton.click();
  } else {
    app.pages.CampPage.toggleTrapEffectiveness(true);
  }
};

/**
 * Go to the specified page.
 *
 * @param {string} page The page to go to.
 */
const gotoPage = (page) => {
  setPage(page);
};

/**
 * Open the specified blueprint type.
 *
 * @param {string} type The blueprint type to open.
 */
const openBlueprint = (type) => {
  if (! app?.pages?.CampPage?.toggleItemBrowser) {
    return;
  }

  if ('camp' === getCurrentPage()) {
    app.pages.CampPage.toggleItemBrowser(type);
    return;
  }

  setPage('Camp');
  setTimeout(() => {
    app.pages.CampPage.toggleItemBrowser(type);
  }, 500);
};

/**
 * Open the map.
 */
const openMap = () => {
  if (hg?.controllers?.TreasureMapController) {
    hg.controllers.TreasureMapController.show();
  }
};

/**
 * Open the map invites.
 */
const openMapInvites = () => {
  if (hg?.controllers?.TreasureMapController) {
    hg.controllers.TreasureMapController.showCommunity();
  }
};

/**
 * Open the marketplace.
 */
const openMarketplace = () => {
  if (hg?.views?.MarketplaceView) {
    hg.views.MarketplaceView.show();
  }
};

/**
 * Show the trap effectiveness meter.
 */
const showTem = () => {
  if (app?.pages?.CampPage?.toggleTrapEffectiveness) {
    app.pages.CampPage.toggleTrapEffectiveness(true);
  }
};

/**
 * Open the inbox.
 */
const openInbox = () => {
  if (messenger?.UI?.notification?.togglePopup) {
    messenger.UI.notification.togglePopup();
  }
};

/**
 * Open the gifts.
 */
const openGifts = () => {
  if (hg?.views?.GiftSelectorView) {
    hg.views.GiftSelectorView.show();
  }
};

/**
 * Disarm the cheese.
 */
const disarmCheese = () => {
  if (hg?.utils?.TrapControl?.disarmBait && hg?.utils?.TrapControl?.disarmBait?.go) {
    hg.utils.TrapControl.disarmBait().go();
  }
};

/**
 * Disarm the charm.
 */
const disarmCharm = () => {
  if (hg?.utils?.TrapControl?.disarmTrinket && hg?.utils?.TrapControl?.disarmTrinket?.go) {
    hg.utils.TrapControl.disarmTrinket().go();
  }
};

/**
 * Open the travel window.
 */
const openTravelWindow = () => {
  doEvent('mh-improved-open-travel-window');
};

/**
 * Travel to the previous location.
 */
const travelToPreviousLocation = () => {
  doEvent('mh-improved-goto-previous-location');
};

const toggleFuel = () => {
  if ('floating_islands' === getCurrentLocation()) {
    doRequest('managers/ajax/environment/floating_islands.php', {
      action: 'toggle_fuel',
    });
  }

  if ('table_of_contents' === getCurrentLocation()) {
    // todo: add the farm locations
  }

  // todo: add the queso locations

  // todo: add vrift
};

export {
  clickMinLuck,
  disarmCharm,
  disarmCheese,
  gotoPage,
  openBlueprint,
  openGifts,
  openInbox,
  openMap,
  openMapInvites,
  openMarketplace,
  showTem,
  openTravelWindow,
  travelToPreviousLocation,
  toggleFuel
};
