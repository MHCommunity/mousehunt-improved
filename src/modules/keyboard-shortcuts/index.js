import {
  addUIStyles,
  createPopup
} from '../utils';

import styles from './styles.css';

const clickMinLuck = () => {
  const minluckButton = document.querySelector('.min-luck-button');
  if (minluckButton) {
    minluckButton.click();
  } else {
    app.pages.CampPage.toggleTrapEffectiveness(true);
  }
};

const showHelpPopup = () => {
  createPopup({
    title: 'MouseHunt Improved Keyboard Shortcuts',
    content: `<div class="mh-ui-keyboard-shortcuts-popup-content">
      <ul class="mh-ui-keyboard-shortcuts-popup-content-list">
        <li class="mh-ui-keyboard-shortcuts-popup-content-section">
          <h2>Navigation</h2>
          <ul class="mh-ui-keyboard-shortcuts-list">
            <li><strong>T</strong>Travel</li>
            <li><strong>J</strong>Journal/Camp</li>
            <li><strong>F</strong>Friends</li>
            <li><strong>S</strong>Shops</li>
            <li><strong>P</strong>Go to your Profile</li>
            <li><strong>M</strong>Open your Map</li>
            <li><strong>I</strong>Open your Map Invites</li>
          </ul>
        </li>
        <li class="mh-ui-keyboard-shortcuts-popup-content-section">
          <h2>Change your Setup</h2>
          <ul class="mh-ui-keyboard-shortcuts-list">
            <li><strong>W</strong>Change your Weapon</li>
            <li><strong>B</strong>Change your Base</li>
            <li><strong>R</strong>Change your Charm</li>
            <li><strong>C</strong>Change your Cheese</li>
            <li><strong>E</strong>Show the TEM</li>
            <li><strong>L</strong><span>Show the CRE popup</span><em>(If you have the userscript installed)</em></li>
          </ul>
        </li>
      </ul>
    </div>`,
    hasCloseButton: true,
    show: true,
    className: 'mh-ui-keyboard-shortcuts-popup'
  });
};

const listenForKeypresses = () => {
  // Listen for the keypress and call the callback when it happens.
  document.addEventListener('keydown', (event) => {
    if (
      document.activeElement instanceof HTMLInputElement || // eslint-disable-line @wordpress/no-global-active-element
      document.activeElement instanceof HTMLTextAreaElement || // eslint-disable-line @wordpress/no-global-active-element
      document.activeElement instanceof HTMLSelectElement || // eslint-disable-line @wordpress/no-global-active-element
      event.metaKey || // if the meta key is pressed, we don't want to do anything.
      event.ctrlKey // if the ctrl key is pressed, we don't want to do anything.
    ) {
      return;
    }

    switch (event.key) {
    case '?': showHelpPopup(); break; // ? for help.
    case 'b': app.pages.CampPage.toggleItemBrowser('base'); break; // B for base.
    case 'c': app.pages.CampPage.toggleItemBrowser('bait'); break; // C for Cheese.
    case 'e': app.pages.CampPage.toggleTrapEffectiveness(true); break; // E for Effectiveness.
    case 'f': hg.utils.PageUtil.setPage('Friends'); break; // F for friends.
    case 'i': hg.controllers.TreasureMapController.showCommunity(); break; // I for map Invites.
    case 'j': hg.utils.PageUtil.setPage('Camp'); break; // J for Journal/camp.
    case 'l': clickMinLuck(); break; // L for Luck.
    case 'm': hg.controllers.TreasureMapController.show(); break; // M for map.
    case 'p': hg.utils.PageUtil.setPage('HunterProfile'); break; // P for Profile.
    case 'r': app.pages.CampPage.toggleItemBrowser('trinket'); break; // r for chaRm.
    case 's': hg.utils.PageUtil.setPage('Shops'); break; // S for shop.
    case 't': hg.utils.PageUtil.setPage('Travel'); break; // T for travel.
    case 'w': app.pages.CampPage.toggleItemBrowser('weapon'); break; // W for Weapon.
    }
  });
};

export default () => {
  addUIStyles(styles);
  listenForKeypresses();
};
