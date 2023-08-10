export default () => {
  /**
   * Expand the travel regions and zoom the map.
   */
  const expandTravelRegions = () => {
    if ('travel' !== getCurrentPage()) {
      return;
    }

    const hud = document.getElementById('mousehuntHud');
    if (hud) {
      const hudHeight = hud.offsetHeight + 30;

      const map = document.querySelector('.travelPage-mapContainer.full');
      if (map) {
        map.style.height = `calc(100vh - ${hudHeight}px)`;
      }
    }

    // eslint-disable-next-line no-undef
    app.pages.TravelPage.zoomOut();

    // eslint-disable-next-line no-undef
    app.pages.TravelPage.zoomOut();

    const regionHeaders = document.querySelectorAll('.travelPage-regionMenu-regionLink');
    if (regionHeaders) {
      regionHeaders.forEach((regionHeader) => {
        regionHeader.setAttribute('onclick', 'return false;');
      });
    }

    const travelAreas = document.querySelectorAll('.travelPage-regionMenu-item');
    if (travelAreas && travelAreas.length > 0) {
      travelAreas.forEach((area) => {
        area.classList.add('active');
        area.classList.remove('contracted');
      });
    }

    const locations = document.querySelectorAll('.travelPage-map-image-environment.active');
    if (locations && locations.length > 0) {
      locations.forEach((location) => {
        location.addEventListener('mouseover', () => {
          location.classList.add('highlight');
        });

        location.addEventListener('mouseout', () => {
          setTimeout(() => {
            location.classList.remove('highlight');
          }, 1000);
        });
      });
    }
  };

  /**
   * Add the tab for Simple Travel.
   */
  const addSimpleTravelTab = () => {
    if ('travel' !== getCurrentPage()) {
      return;
    }

    const exists = document.getElementById('mh-simple-travel-tab');
    if (exists) {
      return;
    }

    const tabContainer = document.querySelector('.mousehuntHud-page-tabHeader-container');
    if (! tabContainer) {
      return;
    }

    const tab = document.createElement('a');
    tab.id = 'mh-simple-travel-tab';
    tab.classList.add('mousehuntHud-page-tabHeader');
    tab.setAttribute('data-tab', 'simple-travel');
    tab.setAttribute('onclick', 'hg.utils.PageUtil.onclickPageTabHandler(this); return false;');

    const tabText = document.createElement('span');
    tabText.textContent = 'Simple Travel';
    tab.appendChild(tabText);

    tabContainer.appendChild(tab);
  };

  /**
   * Add the page for Simple Travel.
   */
  const addSimpleTravelPage = () => {
    if ('travel' !== getCurrentPage()) {
      return;
    }

    const exists = document.getElementById('mh-simple-travel-page');
    if (exists) {
      return;
    }

    const pageContainer = document.querySelector('.mousehuntHud-page-tabContentContainer');
    if (! pageContainer) {
      return;
    }

    const page = document.createElement('div');
    page.id = 'mh-simple-travel-page';
    page.classList.add('mousehuntHud-page-tabContent');
    page.classList.add('simple-travel');
    page.setAttribute('data-tab', 'simple-travel');

    if ('not-set' === getSetting('simple-travel', 'not-set')) {
      const settingTip = document.createElement('div');
      settingTip.classList.add('travelPage-map-prefix');
      settingTip.classList.add('simple-travel-tip');
      settingTip.innerHTML = 'You can set this as the default travel tab in your <a href="https://www.mousehuntgame.com/preferences.php?tab=userscript-settings"> Game Settings</a>.';
      page.appendChild(settingTip);
    }

    const regionMenu = document.querySelector('.travelPage-regionMenu');
    if (! regionMenu) {
      return;
    }

    const regionMenuClone = regionMenu.cloneNode(true);
    const travelLinks = regionMenuClone.querySelectorAll('.travelPage-regionMenu-environmentLink');

    if (travelLinks && travelLinks.length > 0) {
      travelLinks.forEach((link) => {
        link.setAttribute('onclick', 'return false;');
        link.addEventListener('click', (event) => {
          const environment = event.target.getAttribute('data-environment');

          // eslint-disable-next-line no-undef
          app.pages.TravelPage.travel(environment);

          // eslint-disable-next-line no-undef
          hg.utils.PageUtil.setPage('Camp');

          return false;
        });
      });
    }

    page.appendChild(regionMenuClone);

    pageContainer.appendChild(page);
  };

  /**
   * Check the setting and maybe default to Simple Travel.
   */
  const maybeSwitchToSimpleTravel = () => {
    if ('travel' !== getCurrentPage()) {
      return;
    }

    const defaultTravel = getSetting('simple-travel');
    if (! defaultTravel) {
      return;
    }

    // eslint-disable-next-line no-undef
    hg.utils.PageUtil.setPageTab('simple-travel');

    const mapTab = document.querySelector('.mousehuntHud-page-tabHeader.map');
    if (mapTab) {
      mapTab.addEventListener('click', () => {
        setTimeout(() => {
          // eslint-disable-next-line no-undef
          app.pages.TravelPage.zoomIn();

          // eslint-disable-next-line no-undef
          app.pages.TravelPage.zoomIn();

          // eslint-disable-next-line no-undef
          app.pages.TravelPage.zoomIn();

          // eslint-disable-next-line no-undef
          app.pages.TravelPage.zoomIn();

          // eslint-disable-next-line no-undef
          app.pages.TravelPage.zoomOut();

          // eslint-disable-next-line no-undef
          app.pages.TravelPage.zoomOut();
        }, 100);
      });
    }
  };

  const addReminders = () => {
    let reminderText = '';
    let shouldDeactivate = true;

    switch (getCurrentLocation()) {
    case 'rift_valour':
      if (user.quests?.QuestRiftValour?.is_fuel_enabled) {
        reminderText = 'Champion\'s Fire is active.';
      }
      break;
    case 'queso_river':
    case 'queso_plains':
    case 'queso_quarry':
    case 'queso_geyser':
      if (
        user.quests?.QuestQuesoCanyon?.is_wild_tonic_active ||
        user.quests?.QuestQuesoGeyser?.is_wild_tonic_enabled
      ) {
        reminderText = 'Wild Tonic is active.';
      }
      break;
    case 'floating_islands':
      if ('launch_pad_island' === user.quests?.QuestFloatingIslands?.hunting_site_atts?.island_power_type) {
        break;
      }

      if (
        ! user.quests?.QuestFloatingIslands?.hunting_site_atts?.is_fuel_enabled && // BW not active.
        ! (
          user.quests?.QuestFloatingIslands?.hunting_site_atts?.is_vault_island && // is SP.
          user.quests.QuestFloatingIslands.hunting_site_atts.island_mod_panels[2].is_complete // is on 4th tile.
        )
      ) {
        shouldDeactivate = false;
        reminderText = 'Bottled Wind is <strong>not</strong> active.';
      }
      break;
    case 'foreword_farm':
    case 'prologue_pond':
    case 'table_of_contents':
      if (user.quests?.QuestProloguePond?.is_fuel_enabled ||
        user.quests?.QuestForewordFarm?.is_fuel_enabled ||
        user.quests?.QuestTableOfContents?.is_fuel_enabled) {
        reminderText = 'Condensed Creativity is active.';
      } else {
        shouldDeactivate = false;
        reminderText = 'Condensed Creativity is <strong>not</strong> active.';
      }
      break;
    }

    if (reminderText) {
      showHornMessage({
        title: shouldDeactivate ? 'Don\'t waste your resources!' : 'Don\'t waste your hunts!',
        text: reminderText,
        button: 'Dismiss',
        dismiss: 4000,
      });

      // temporary fix for the dismiss timing
      setTimeout(() => {
        const dismiss = document.querySelector('#mh-custom-horn-message .huntersHornView__messageAction');
        if (dismiss) {
          dismiss.click();
        }
      }, 3000);
    }
  };

  /**
   * Add the tab & page for Simple Travel.
   */
  const addSimpleTravel = () => {
    addSimpleTravelTab();
    addSimpleTravelPage();
    maybeSwitchToSimpleTravel();
  };

  /**
   * Add the settings for Simple Travel.
   */
  const addSimpleTravelSetting = () => {
    addSetting('Travel Tweaks - Default to simple travel', 'simple-travel', false, 'Use the simple travel page by default.', {}, addSettingsTab());
    addSetting('Travel Tweaks - Show travel reminders', 'travel-reminders', true, 'Show reminders about active resources.', {}, addSettingsTab());
  };

  onPageChange({ change: expandTravelRegions });
  expandTravelRegions();

  onPageChange({ change: addSimpleTravel });
  addSimpleTravel();

  onPageChange({ change: addSimpleTravelSetting });
  addSimpleTravelSetting();

  if (window.location.search.includes('tab=simple-travel')) {
    // eslint-disable-next-line no-undef
    hg.utils.PageUtil.setPageTab('simple-travel');
  }

  if (getSetting('travel-reminders', true)) {
    onEvent('travel_complete', () => {
      setTimeout(() => {
        addReminders();
      }, 250);
    });
  }

  addStyles(`.travelPage-map-spacer,
  .travelPage-map-simpleToggle,
  .mousehuntHud-page-tabContent.map.full .travelPage-map-simpleToggle.full,
  .mousehuntHud-page-tabContent.map.full .travelPage-map-prefix.full {
    display: none;
  }

  .travelPage-regionMenu {
    width: 22%;
    overflow: scroll;
  }

  .travelPage-map-environment-detailContainer {
    left: 22%;
    width: 78%;
  }

  .travelPage-regionMenu-environmentLink.active {
    color: #000;
    background: #a4cafc;
  }

  .travelPage-regionMenu-stats {
    color: #4d4d4d;
    background-color: #d8d8d8;
  }

  .travelPage-regionMenu-numFriends {
    padding: 0;
    background: none;
  }

  .travelPage-mapContainer.full {
    height: auto;
    min-height: 800px;
    max-height: 900px;
    border: none;
  }

  .travelPage-map-imageContainer {
    width: 78%;
  }

  .travelPage-map-zoomContainer {
    bottom: 300px;
    transform: scale(1.5);
  }

  .travelPage-map-image-environment-name {
    top: 70px;
    z-index: 15;
    font-size: 22px;
    font-variant: none;
    text-shadow: 1px 1px #000, 0 0 10px #000, 8px 12px 9px #000;
  }

  .travelPage-map-image-environment.locked .travelPage-map-image-environment-status {
    z-index: 1;
    opacity: 0.5;
  }

  .travelPage-map-image-environment-star {
    z-index: 10;
  }

  .travelPage-map-image-environment-button {
    top: 100px;
    transform: scale(1.2);
  }

  .travelPage-regionMenu-environmentLink.mystery {
    display: inline-block;
    color: #9e9e9e;
    pointer-events: none;
  }

  .travelPage-regionMenu-item[data-region="riftopia"] {
    display: block !important;
  }

  .travelPage-regionMenu-item[data-region="riftopia"] .travelPage-regionMenu-item-contents {
    display: block !important;
  }

  .travelPage-regionMenu-regionLink:hover,
  .travelPage-regionMenu-regionLink:focus {
    cursor: unset;
  }

  #mh-simple-travel-page .travelPage-map-prefix {
    display: block;
  }

  #mh-simple-travel-page .travelPage-regionMenu {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    width: 100%;
    margin-bottom: 50px;
    overflow: visible;
    background-color: transparent;
  }

  #mh-simple-travel-page .travelPage-regionMenu-item {
    margin: 1px;
    background-color: #e2e2e2;
    outline: 1px solid #4c71b4;
  }

  #mh-simple-travel-page .travelPage-regionMenu-item[data-region="gnawnia"],
  #mh-simple-travel-page .travelPage-regionMenu-item[data-region="valour"],
  #mh-simple-travel-page .travelPage-regionMenu-item[data-region="whisker_woods"],
  #mh-simple-travel-page .travelPage-regionMenu-item[data-region="burroughs"],
  #mh-simple-travel-page .travelPage-regionMenu-item[data-region="furoma"] {
    min-height: 215px;
  }

  #mh-simple-travel-page .travelPage-regionMenu-item[data-region="riftopia"] {
    min-height: 250px;
  }

  #mh-simple-travel-page .travelPage-regionMenu-environments {
    width: 150px;
    box-shadow: none;
  }

  #mh-simple-travel-page .travelPage-regionMenu-item-contents {
    overflow: visible !important;
  }

  #mh-simple-travel-page .travelPage-regionMenu-environmentLink.active {
    color: #4e6081;
  }

  #mh-simple-travel-page .travelPage-regionMenu-environmentLink:hover,
  #mh-simple-travel-page .travelPage-regionMenu-environmentLink:focus {
    color: #fff;
    background-color: #6383bf;
  }

  .huntersHornView__messageContent strong {
    font-weight: 900;
  }
  `);
};
