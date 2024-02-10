import { doEvent, getCurrentPage } from '@utils';

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
  if ('wiki' === page.toLowerCase()) {
    doEvent('mh-improved-open-wiki');
    return;
  }

  hg.utils.PageUtil.setPage(page);
};

/**
 * Open the specified blueprint type.
 *
 * @param {string} type The blueprint type to open.
 */
const openBlueprint = (type) => {
  const open = app.pages.CampPage.toggleItemBrowser;
  if ('camp' === getCurrentPage()) {
    open(type);
    return;
  }

  hg.utils.PageUtil.setPage('Camp');
  setTimeout(() => {
    open(type);
  }, 500);
};

/**
 * Open the map.
 */
const openMap = () => {
  hg.controllers.TreasureMapController.show();
};

/**
 * Open the map invites.
 */
const openMapInvites = () => {
  hg.controllers.TreasureMapController.showCommunity();
};

/**
 * Open the marketplace.
 */
const openMarketplace = () => {
  hg.views.MarketplaceView.show();
};

/**
 * Show the trap effectiveness meter.
 */
const showTem = () => {
  app.pages.CampPage.toggleTrapEffectiveness(true);
};

/**
 * Open the inbox.
 */
const openInbox = () => {
  messenger.UI.notification.togglePopup();
};

/**
 * Open the gifts.
 */
const openGifts = () => {
  hg.views.GiftSelectorView.show();
};

/**
 * Disarm the cheese.
 */
const disarmCheese = () => {
  hg.utils.TrapControl.disarmBait().go();
};

/**
 * Disarm the charm.
 */
const disarmCharm = () => {
  hg.utils.TrapControl.disarmTrinket().go();
};

/**
 * Open the travel window.
 */
const openTravelWindow = () => {
  eventRegistry.doEvent('mh-improved-open-travel-window');
};

/**
 * Travel to the previous location.
 */
const travelToPreviousLocation = () => {
  eventRegistry.doEvent('mh-improved-goto-previous-location');
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
  travelToPreviousLocation
};
