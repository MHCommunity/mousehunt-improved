import {
  addSubmenuItem,
  addUIStyles,
  getCurrentLocation,
  getCurrentPage,
  getCurrentTab,
  getMhuiSetting,
  getRelicHunterLocation,
  makeElement,
  onEvent,
  onNavigation,
  onPageChange,
  onTravel,
  showHornMessage
} from '../utils';

import environments from '../../data/environments.json';

import styles from './styles.css';

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

  setTimeout(() => {
    app.pages.TravelPage.zoomOut();
  }, 500);
};

const travelClickHandler = (event) => {
  const environment = event.target.getAttribute('data-environment');

  // eslint-disable-next-line no-undef
  app.pages.TravelPage.travel(environment);

  // eslint-disable-next-line no-undef
  hg.utils.PageUtil.setPage('Camp');
};

const cloneRegionMenu = () => {
  const regionMenu = document.querySelector('.travelPage-regionMenu');
  if (! regionMenu) {
    return;
  }

  const regionMenuClone = regionMenu.cloneNode(true);
  const travelLinks = regionMenuClone.querySelectorAll('.travelPage-regionMenu-environmentLink');

  if (travelLinks && travelLinks.length > 0) {
    travelLinks.forEach((link) => {
      link.setAttribute('onclick', 'return false;');
      link.addEventListener('click', travelClickHandler);
    });
  }

  return regionMenuClone;
};

const addTab = (id, label) => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  const exists = document.getElementById(`mh-${id}-tab`);
  if (exists) {
    return;
  }

  const tabContainer = document.querySelector('.mousehuntHud-page-tabHeader-container');
  if (! tabContainer) {
    return;
  }

  const tab = makeElement('a', 'mousehuntHud-page-tabHeader');
  tab.id = `mh-${id}-tab`;
  tab.setAttribute('data-tab', id);
  tab.setAttribute('onclick', 'hg.utils.PageUtil.onclickPageTabHandler(this); return false;');

  makeElement('span', '', label, tab);

  tabContainer.appendChild(tab);
};

const addPage = (id, content) => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  const exists = document.getElementById(`mh-${id}-page`);
  if (exists) {
    return;
  }

  const pageContainer = document.querySelector('.mousehuntHud-page-tabContentContainer');
  if (! pageContainer) {
    return;
  }

  const page = makeElement('div', ['mousehuntHud-page-tabContent', id]);
  page.id = `mh-${id}-page`;
  page.setAttribute('data-tab', id);

  if (! content) {
    const blank = makeElement('div');
    page.appendChild(blank);
  } else {
    page.appendChild(content);
  }

  pageContainer.appendChild(page);
};

const addSimpleTravelPage = () => {
  expandTravelRegions();
  const wrapper = makeElement('div', 'travelPage-wrapper');

  if ('not-set' === getMhuiSetting('better-travel-default-to-simple-travel', 'not-set')) {
    const settingTip = makeElement('div', ['travelPage-map-prefix', 'simple-travel-tip'], 'You can set this as the default travel tab in the <a href="https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings"> Game Settings</a>.');
    wrapper.appendChild(settingTip);
  }

  const regionMenu = cloneRegionMenu();

  if (getMhuiSetting('better-travel-show-alphabetized-list', false)) {
    const alphaWrapper = makeElement('div', 'travelPage-alpha-wrapper');

    const alphaContent = makeElement('div', 'travelPage-regionMenu');
    const alphaHeader = makeElement('div', ['travelPage-regionMenu-item', 'active']);

    const alphaList = makeElement('div', 'travelPage-regionMenu-item-contents');
    const alphaListContent = makeElement('div', 'travelPage-regionMenu-environments');

    const links = regionMenu.querySelectorAll('.travelPage-regionMenu-environmentLink');

    // Clone the links, sort them by name, and add them to the alpha list.
    const sortedLinks = Array.from(links).sort((a, b) => {
      const aName = a.innerText;
      const bName = b.innerText;

      if (aName < bName) {
        return -1;
      }

      if (aName > bName) {
        return 1;
      }

      return 0;
    });

    sortedLinks.forEach((link) => {
      // make a copy of the link
      const linkClone = link.cloneNode(true);
      alphaListContent.appendChild(linkClone);
      linkClone.addEventListener('click', travelClickHandler);
    });

    alphaList.appendChild(alphaListContent);

    alphaHeader.appendChild(alphaList);
    alphaContent.appendChild(alphaHeader);

    alphaWrapper.appendChild(alphaContent);

    wrapper.appendChild(alphaWrapper);
  }

  wrapper.appendChild(regionMenu);

  addPage('simple-travel', wrapper);
};

const addReminders = () => {
  const reminderOpts = {
    title: 'Travel Reminder',
    dismiss: 4000,
  };

  switch (getCurrentLocation()) {
  case 'rift_valour':
    if (user.quests?.QuestRiftValour?.is_fuel_enabled) {
      reminderOpts.text = 'Champion\'s Fire is active.';
      reminderOpts.image = 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/6622efd1db7028b30f48b15771138720.png?cv=2';
      reminderOpts.button = 'Deactivate';
      reminderOpts.action = () => {
        const button = document.querySelector('.valourRiftHUD-fuelContainer-armButton');
        if (button) {
          button.click();
        }
      };
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
      reminderOpts.text = 'Wild Tonic is active.';
      reminderOpts.image = 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/b6b9f97a1ee3692fdff0b5a206adf7e1.png?cv=2';
      reminderOpts.button = 'Deactivate';
      reminderOpts.action = () => {
        const button = document.querySelector('.quesoHUD-wildTonic-button');
        if (button) {
          button.click();
        }
      };
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
      reminderOpts.text = 'Bottled Wind is <strong>not</strong> active.';
      reminderOpts.image = 'https://www.mousehuntgame.com/images/ui/hud/floating_islands/items/bottled_wind_stat_item.png?asset_cache_version=2';
      reminderOpts.button = 'Activate';
      reminderOpts.action = () => {
        const button = document.querySelector('.floatingIslandsHUD-fuel-button');
        if (button) {
          button.click();
        }
      };
    }
    break;
  case 'foreword_farm':
  case 'prologue_pond':
  case 'table_of_contents':
    if (user.quests?.QuestProloguePond?.is_fuel_enabled ||
      user.quests?.QuestForewordFarm?.is_fuel_enabled ||
      user.quests?.QuestTableOfContents?.is_fuel_enabled) {
      reminderOpts.text = 'Condensed Creativity is active.';
      reminderOpts.button = 'Deactivate';
    } else {
      reminderOpts.text = 'Condensed Creativity is <strong>not</strong> active.';
      reminderOpts.button = 'Activate';
    }

    reminderOpts.image = 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/4f5d55c1eff77474c7363f0e52d03e49.png?cv=2';
    reminderOpts.action = hg.views.HeadsUpDisplayFolkloreForestRegionView.toggleFuel;
    break;
  }

  if (reminderOpts.text) {
    showHornMessage(reminderOpts);
  }
};

/**
 * Add the tab & page for Simple Travel.
 */
const addSimpleTravel = () => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  addTab('simple-travel', 'Simple Travel');
  addSimpleTravelPage();
};

const addRegionToTravelDropdown = () => {
  const currentLocation = getCurrentLocation();

  // get the object that matches the current location
  const currentRegion = environments.find((environment) => {
    return environment.id === currentLocation;
  });

  // get the other locations in the same region
  const otherRegions = environments.filter((environment) => {
    if (! environment?.region || ! currentRegion?.region) {
      return false;
    }

    return environment.region === currentRegion.region;
  });

  // remove the current location from the list
  otherRegions.splice(otherRegions.findIndex((environment) => {
    return environment.id === currentLocation;
  }), 1);

  // remove any existing custom submenu items that we've added
  const existingCustomSubmenuItems = document.querySelectorAll('.mhui-region-travel-item');
  if (existingCustomSubmenuItems) {
    existingCustomSubmenuItems.forEach((item) => {
      item.remove();
    });
  }

  // add the custom submenu items
  otherRegions.forEach((region) => {
    addSubmenuItem({
      menu: 'travel',
      label: region.name,
      icon: region.image,
      callback: () => {
        app.pages.TravelPage.travel(region.id);
      },
      class: 'mhui-region-travel-item',
    });
  });
};

const maybeShowTravelReminders = () => {
  if (! getMhuiSetting('better-travel-show-reminders', true)) {
    return;
  }

  onEvent('travel_complete', () => {
    setTimeout(() => {
      addReminders();
    }, 250);
  });
};

const initSimpleTab = () => {
  if ('simple-travel' === getCurrentTab()) {
    const isActive = document.querySelector('.mousehuntHud-page-tabContent.simple-travel');
    if (! isActive || (isActive && isActive.classList.contains('active'))) {
      return;
    }

    hg.utils.PageUtil.setPageTab('simple-travel');
  }
};

const maybeSetTab = () => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  initSimpleTab();

  if ('map' !== getCurrentTab()) {
    return;
  }

  if (! getMhuiSetting('better-travel-default-to-simple-travel', false)) {
    return;
  }

  hg.utils.PageUtil.setPageTab('simple-travel'); // eslint-disable-line no-undef
};

const addRhToSimpleTravel = async () => {
  const location = await getRelicHunterLocation();
  if (! location) {
    return;
  }

  const travelLink = document.querySelectorAll(`.travelPage-regionMenu-environmentLink[data-environment="${location.id}"]`);
  if (! travelLink.length) {
    return;
  }

  // Add the RH class to the travel link so we can style it.
  travelLink.forEach((link) => {
    link.classList.add('relic-hunter-is-here');
  });
};

const addRhToMap = async () => {
  const location = await getRelicHunterLocation();
  if (! location) {
    return;
  }

  const mapLocation = document.querySelector(`.travelPage-map-image-environment[data-environment-type="${location.id}"]`);
  if (! mapLocation) {
    return;
  }

  const rh = makeElement('div', 'map-relic-hunter-is-here');
  makeElement('div', 'map-relic-hunter-is-here-image', '', rh);
  mapLocation.appendChild(rh);
};

const maybeDoMapView = () => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  if ('map' !== getCurrentTab()) {
    return;
  }

  expandTravelRegions();
  addRhToMap();
};

const listenTabChange = () => {
  _tabHandler = hg.utils.PageUtil.onclickPageTabHandler;
  hg.utils.PageUtil.onclickPageTabHandler = (tab) => {
    _tabHandler(tab);

    maybeDoMapView();
  };
};

const main = () => {
  onNavigation(() => {
    addSimpleTravel();
    addRhToSimpleTravel();
  }, {
    page: 'travel',
  });

  onPageChange({
    travel: { show: maybeSetTab }
  });

  listenTabChange();

  initSimpleTab();

  maybeDoMapView();
  maybeShowTravelReminders();

  addRegionToTravelDropdown();
  onTravel(null, { callback: addRegionToTravelDropdown });
};

export default () => {
  addUIStyles(styles);
  main();
};
