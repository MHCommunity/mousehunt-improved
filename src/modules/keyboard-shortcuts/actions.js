import { getCurrentPage } from '@utils';

const clickMinLuck = () => {
  const minluckButton = document.querySelector('.min-luck-button');
  if (minluckButton) {
    minluckButton.click();
  } else {
    app.pages.CampPage.toggleTrapEffectiveness(true);
  }
};

const gotoPage = (page) => {
  hg.utils.PageUtil.setPage(page);
};

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

const openMap = () => {
  hg.controllers.TreasureMapController.show();
};

const openMapInvites = () => {
  hg.controllers.TreasureMapController.showCommunity();
};

const openMarketplace = () => {
  hg.views.MarketplaceView.show();
};

const showTem = () => {
  app.pages.CampPage.toggleTrapEffectiveness(true);
};

const openInbox = () => {
  messenger.UI.notification.togglePopup();
};

const openGifts = () => {
  hg.views.GiftSelectorView.showInbox();
};

const disarmCheese = () => {
  hg.utils.TrapControl.disarmBait().go();
};

const disarmCharm = () => {
  hg.utils.TrapControl.disarmTrinket().go();
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
  showTem
};
