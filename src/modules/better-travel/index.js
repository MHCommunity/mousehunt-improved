import { addUIStyles } from '../utils';
import styles from './styles.css';
import environments from '../../data/environments.json';

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
  const wrapper = makeElement('div', 'travelPage-wrapper');

  if ('not-set' === getSetting('simple-travel', 'not-set')) {
    const settingTip = makeElement('div', ['travelPage-map-prefix', 'simple-travel-tip'], 'You can set this as the default travel tab in your <a href="https://www.mousehuntgame.com/preferences.php?tab=userscript-settings"> Game Settings</a>.');
    wrapper.appendChild(settingTip);
  }

  const regionMenu = cloneRegionMenu();

  if (getSetting('simple-travel-alpha-sort', false)) {
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
  if ('travel' !== getCurrentPage()) {
    return;
  }

  addTab('simple-travel', 'Simple Travel');
  addSimpleTravelPage();
  maybeSwitchToSimpleTravel();
};

const addRegionToTravelDropdown = () => {
  const currentLocation = getCurrentLocation();

  // get the object that matches the current location
  const currentRegion = environments.find((environment) => {
    return environment.id === currentLocation;
  });

  // get the other locations in the same region
  const otherRegions = environments.filter((environment) => {
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

const main = () => {
  addUIStyles(styles);

  onPageChange({ change: expandTravelRegions });
  expandTravelRegions();

  onPageChange({ change: addSimpleTravel });
  addSimpleTravel();

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

  addRegionToTravelDropdown();
  onTravel(null, { callback: addRegionToTravelDropdown });
};

export default main;
