const clickMinLuck = () => {
  const minluckButton = document.querySelector('.min-luck-button');
  if (minluckButton) {
    minluckButton.click();
  } else {
    app.pages.CampPage.toggleTrapEffectiveness(true);
  }
};

const listenForKeypresses = () => {
  // Listen for the keypress and call the callback when it happens.
  document.addEventListener('keydown', (event) => {
    if (
      document.activeElement instanceof HTMLInputElement || // eslint-disable-line @wordpress/no-global-active-element
      document.activeElement instanceof HTMLTextAreaElement || // eslint-disable-line @wordpress/no-global-active-element
      document.activeElement instanceof HTMLSelectElement // eslint-disable-line @wordpress/no-global-active-element
    ) {
      return;
    }

    switch (event.key) {
    case 't':
      // T for travel.
      hg.utils.PageUtil.setPage('Travel');
      break;
    case 'c':
      // C for camp.
      hg.utils.PageUtil.setPage('Camp');
      break;
    case 'm':
      // M for map.
      hg.controllers.TreasureMapController.show();
      break;
    case 'i':
      // I for map Invites.
      hg.controllers.TreasureMapController.showCommunity();
      break;
    case 'w':
      // W for Weapon.
      app.pages.CampPage.toggleItemBrowser('weapon');
      break;
    case 'b':
      // B for base.
      app.pages.CampPage.toggleItemBrowser('base');
      break;
    case 'h':
      // H for cHarm.
      app.pages.CampPage.toggleItemBrowser('trinket');
      break;
    case 'a':
      // A for bAit.
      app.pages.CampPage.toggleItemBrowser('bait');
      break;
    case 'e':
      // E for Effectiveness.
      app.pages.CampPage.toggleTrapEffectiveness(true);
      break;
    case 'l':
      // L for Luck.
      clickMinLuck();
      break;
    }
  });
};

export default () => {
  listenForKeypresses();
};
