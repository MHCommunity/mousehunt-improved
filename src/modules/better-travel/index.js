import {
  addStyles,
  addSubmenuDivider,
  addSubmenuItem,
  getCurrentLocation,
  getCurrentPage,
  getCurrentTab,
  getData,
  getFlag,
  getRelicHunterLocation,
  getSetting,
  makeElement,
  makeFavoriteButton,
  onEvent,
  onNavigation,
  removeSubmenuItem,
  sessionGet,
  setPage,
  setTab
} from '@utils';

import { getTravelSetting, saveTravelSetting, travelTo } from './travel-utils';

import addReminders from './reminders';
import travelWindow from './travel-window';

import settings from './settings';
import styles from './styles.css';
import travelMenuHidingStyles from './travel-menu-hiding.css';

/**
 * Expand the travel regions and zoom the map.
 */
const expandTravelRegions = () => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  const hud = document.querySelector('#mousehuntHud');
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

  if (app?.pages?.TravelPage?.zoomOut) {
    setTimeout(() => {
      app.pages.TravelPage.zoomOut();
    }, 500);
  }
};

const travelClickHandler = (event) => {
  if (app?.pages?.TravelPage?.travel) {
    travelTo(event.target.getAttribute('data-environment'));
    setPage('Camp');
  }
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

  const exists = document.querySelector(`#mh-${id}-tab`);
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

  tabContainer.append(tab);
};

const addPage = (id, content) => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  const exists = document.querySelector(`#mh-${id}-page`);
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

  if (content) {
    page.append(content);
  } else {
    const blank = makeElement('div');
    page.append(blank);
  }

  pageContainer.append(page);
};

const addAlphabetizedList = (regionMenu) => {
  const alphaWrapper = makeElement('div', 'travelPage-alpha-wrapper');

  const alphaContent = makeElement('div', 'travelPage-regionMenu');
  const alphaHeader = makeElement('div', ['travelPage-regionMenu-item', 'active']);

  const alphaList = makeElement('div', 'travelPage-regionMenu-item-contents');
  const alphaListContent = makeElement('div', 'travelPage-regionMenu-environments');

  const links = regionMenu.querySelectorAll('.travelPage-regionMenu-environmentLink');

  // Clone the links, sort them by name, and add them to the alpha list.
  const sortedLinks = [...links].sort((a, b) => {
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

  // While sorting, add a class to the first occurrence of each letter.
  let lastLetter = '';

  sortedLinks.forEach((link) => {
    // make a copy of the link
    const linkClone = link.cloneNode(true);
    alphaListContent.append(linkClone);
    linkClone.addEventListener('click', travelClickHandler);

    // get the first letter of the link
    const firstLetter = linkClone.innerText.charAt(0).toLowerCase();

    // if the first letter is different than the last letter, add a class
    if (firstLetter !== lastLetter) {
      linkClone.classList.add('first-letter');
    }

    // set the last letter to the current letter
    lastLetter = firstLetter;

    // Check if the link is in the list of environments, if it's not, then it's an event location.
    const environment = environments.find((env) => {
      return env.id === link.getAttribute('data-environment');
    });

    if (! environment) {
      linkClone.classList.add('event-location');
    }
  });

  alphaList.append(alphaListContent);

  alphaHeader.append(alphaList);
  alphaContent.append(alphaHeader);

  alphaWrapper.append(alphaContent);

  return alphaWrapper;
};

const addSimpleTravelPage = () => {
  expandTravelRegions();
  const wrapper = makeElement('div', 'travelPage-wrapper');

  if ('not-set' === getSetting('better-travel.default-to-simple-travel', 'not-set')) {
    const settingTip = makeElement('div', ['travelPage-map-prefix', 'simple-travel-tip'], 'You can set this as the default travel tab in the <a href="https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings">MouseHunt Improved settings</a>.');
    wrapper.append(settingTip);
  }

  const regionMenu = cloneRegionMenu();

  if (getSetting('better-travel.show-alphabetized-list', false)) {
    wrapper.append(addAlphabetizedList(regionMenu));
  }

  wrapper.append(regionMenu);

  addPage('simple-travel', wrapper);
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

const getPreviousLocation = () => {
  const previousLocation = getSetting('better-travel.previous-location', false);
  if (previousLocation && previousLocation !== getCurrentLocation()) {
    return environments.find((environment) => {
      return environment.id === previousLocation;
    });
  }

  return false;
};

const goToPreviousLocation = () => {
  const previousLocation = getPreviousLocation();
  if (previousLocation) {
    travelTo(previousLocation.id);
  }
};

const addToTravelDropdown = async () => {
  const currentLocation = getCurrentLocation();

  // merge the event environments into the environments array
  const eventEnvironments = await getData('environments-events');
  environments.push(...eventEnvironments);

  // get the object that matches the current location
  let currentRegion = environments.find((environment) => {
    return environment.id === currentLocation;
  });

  if (! currentRegion) {
    // See if it's an event location.
    currentRegion = eventEnvironments.find((environment) => {
      return environment.id === currentLocation;
    });

    if (! currentRegion) {
      return;
    }
  }

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
  const existingCustomSubmenuItems = document.querySelectorAll('.mh-improved-better-travel-menu-item');
  if (existingCustomSubmenuItems) {
    existingCustomSubmenuItems.forEach((item) => {
      item.remove();
    });
  }

  const previousLocation = getPreviousLocation();
  // add the previous location to the top of the list
  if (previousLocation) {
    addSubmenuItem({
      menu: 'travel',
      label: `Back to ${previousLocation.name}`,
      icon: 'https://www.mousehuntgame.com/images/ui/puzzle/refresh.png',
      callback: goToPreviousLocation,
      class: 'mh-improved-better-travel-menu-item mh-improved-better-travel-previous-location',
    });
  }

  // add the custom submenu items
  otherRegions.forEach((region) => {
    if (region.id === currentLocation) {
      return;
    }

    addSubmenuItem({
      menu: 'travel',
      label: region.name,
      icon: region.image,
      callback: () => {
        travelTo(region.id);
      },
      class: 'mh-improved-better-travel-menu-item mh-improved-better-travel-region-location',
    });
  });

  const favorites = getLocationFavorites();
  if (favorites && favorites.length > 0) {
    addSubmenuDivider('travel', 'mh-improved-better-travel-favorites-divider');

    favorites.forEach((favorite) => {
      const favoriteRegion = environments.find((environment) => {
        return environment.id === favorite;
      });

      if (favoriteRegion) {
        addSubmenuItem({
          menu: 'travel',
          label: favoriteRegion.name,
          icon: favoriteRegion.image,
          callback: () => {
            travelTo(favoriteRegion.id);
          },
          class: 'mh-improved-better-travel-menu-item mh-improved-better-travel-favorite-location',
        });
      }
    });
  }
};

const onTravelComplete = () => {
  onEvent('travel_complete', () => {
    saveTravelLocation();

    setTimeout(() => {
      if (getSetting('better-travel.show-reminders', true)) {
        addReminders();
      }

      addToTravelDropdown();
    }, 250);
  });
};

const initSimpleTab = () => {
  if ('simple-travel' === getCurrentTab()) {
    const isActive = document.querySelector('.mousehuntHud-page-tabContent.simple-travel');
    if (! isActive || (isActive && isActive.classList.contains('active'))) {
      return;
    }

    setTab('simple-travel');
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

  if (! getSetting('better-travel.default-to-simple-travel', false)) {
    return;
  }

  setTab('simple-travel');
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

  const rh = makeElement('div', ['map-relic-hunter-is-here', 'travelPage-map-image-environment-pointer']);
  makeElement('div', ['map-relic-hunter-is-here-image', 'travelPage-map-image-environment-pointer-image'], '', rh);
  mapLocation.append(rh);
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

let _tabHandler = null;
const listenTabChange = () => {
  if (_tabHandler) {
    return;
  }

  if (! hg?.utils?.PageUtil?.onclickPageTabHandler) {
    return;
  }

  _tabHandler = hg.utils.PageUtil.onclickPageTabHandler;
  hg.utils.PageUtil.onclickPageTabHandler = (tab) => {
    _tabHandler(tab);

    maybeDoMapView();
  };
};

const saveTravelLocation = () => {
  const isLocationDashboardRefreshing = sessionGet('doing-location-refresh', false);
  if (isLocationDashboardRefreshing) {
    return;
  }

  // we want to update the 'previousLocation' setting with what the 'currentLocation' is
  // and then update the 'currentLocation' setting with what getCurrentLocation() returns
  const previousLocation = getTravelSetting('current-location', 'not-set');
  const currentLocation = getCurrentLocation();

  if (currentLocation === previousLocation) {
    return;
  }

  saveTravelSetting('previous-location', previousLocation);
  saveTravelSetting('current-location', currentLocation);
};

const getLocationFavorites = () => {
  const faves = getSetting('better-travel.favorites', []);
  return faves;
};

const isLocationFavorite = (type) => {
  return getLocationFavorites().includes(type);
};

const saveLocationFavorites = (favorites) => {
  saveTravelSetting('favorites', favorites);
};

const addToLocationFavorites = (type) => {
  if (! isLocationFavorite(type)) {
    const faves = getLocationFavorites();
    faves.push(type);
    saveLocationFavorites(faves);
  }
};

const removeFromLocationFavorites = (type) => {
  if (getLocationFavorites()) {
    const faves = getLocationFavorites();
    faves.splice(faves.indexOf(type), 1);
    saveLocationFavorites(faves);
  }
};

const addFavoriteButtonsToTravelPage = async () => {
  const locations = document.querySelectorAll('.travelPage-map-environment-detailContainer .travelPage-map-environment-detail');
  if (! locations) {
    return;
  }

  const locationFavorites = getLocationFavorites();

  locations.forEach((location) => {
    const type = location.getAttribute('data-environment-type');
    if (! type) {
      return;
    }

    // Don't add a favorite button to event locations.
    const isEventLocation = environments.find((environment) => {
      return environment.id === type;
    });

    if (isEventLocation) {
      return;
    }

    const isFavorite = locationFavorites.includes(type);

    makeFavoriteButton({
      id: `better-travel-favorite-${type}`,
      target: location.querySelector('.travelPage-map-environment-detail-title'),
      size: 'small',
      state: isFavorite,
      isSetting: false,
      defaultState: false,
      onActivate: () => {
        addToLocationFavorites(type);
        addToTravelDropdown();
      },
      onDeactivate: () => {
        removeFromLocationFavorites(type);
        removeSubmenuItem(type);
      },
    });
  });
};

const main = () => {
  if (getSetting('better-travel.travel-window', true)) {
    travelWindow();
  }

  onNavigation(() => {
    addSimpleTravel();
    addRhToSimpleTravel();
    addFavoriteButtonsToTravelPage();
    maybeSetTab();
  }, {
    page: 'travel',
  });

  listenTabChange();

  initSimpleTab();

  maybeDoMapView();
  onTravelComplete();

  saveTravelLocation();
  addToTravelDropdown();

  onEvent('mh-improved-goto-previous-location', goToPreviousLocation);
};

let environments = [];

/**
 * Initialize the module.
 */
const init = async () => {
  const stylesJoined = [styles];

  if (! getFlag('no-travel-menu-hiding')) {
    stylesJoined.push(travelMenuHidingStyles);
  }

  addStyles(stylesJoined, 'better-travel');

  environments = await getData('environments');

  main();
};

export default {
  id: 'better-travel',
  name: 'Better Travel',
  type: 'better',
  default: true,
  description: 'Adds locations in the current region to the Travel dropdown menu, a "Simple Travel" tab with a grid of locations, an optional alphabetized list, an indicator for where the Relic Hunter is.',
  load: init,
  settings,
};
