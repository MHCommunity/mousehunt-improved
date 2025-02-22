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
  onPageChange,
  onRequest,
  removeSubmenuItem,
  sessionGet,
  setTab,
  travelTo
} from '@utils';

import { getTravelSetting, saveTravelSetting } from './utils';

import addReminders from './modules/reminders';
import travelWindow from './modules/travel-window';

import settings from './settings';
import styles from './styles/styles.css';
import travelMenuHidingStyles from './styles/travel-menu-hiding.css';

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

/**
 * Travel to a location when clicking on a link.
 *
 * @param {Event} event The click event.
 */
const travelClickHandler = (event) => {
  if (app?.pages?.TravelPage?.travel) {
    travelTo(event.target.getAttribute('data-environment'));
  }
};

/**
 * Clone the region menu and add click handlers to the links.
 *
 * @return {Element|false} The cloned region menu.
 */
const cloneRegionMenu = () => {
  const regionMenu = document.querySelector('.travelPage-regionMenu');
  if (! regionMenu) {
    return false;
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

/**
 * Add a tab to the travel page.
 *
 * @param {string} id    The ID of the tab.
 * @param {string} label The label for the tab.
 */
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

/**
 * Add the page content to the travel page.
 *
 * @param {string}  id      The ID of the page.
 * @param {Element} content The content to add to the page.
 */
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

/**
 * Add an alphabetized list of locations to the simple travel page.
 *
 * @param {Element} regionMenu The region menu to clone.
 *
 * @return {Element} The alphabetized list.
 */
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

/**
 * Add the Simple Travel page.
 */
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

/**
 * Get the previous location.
 *
 * @return {Object|boolean} The previous location object or false.
 */
const getPreviousLocation = () => {
  const previousLocation = getSetting('better-travel.previous-location', false);
  if (previousLocation && previousLocation !== getCurrentLocation()) {
    return environments.find((environment) => {
      return environment.id === previousLocation;
    });
  }

  return false;
};

/**
 * Travel to the previous location.
 */
const goToPreviousLocation = () => {
  const previousLocation = getPreviousLocation();
  if (previousLocation) {
    travelTo(previousLocation.id);
  }
};

/**
 * Add the current region locations to the travel dropdown.
 */
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

    if ('acolyte_realm' === environment.id) {
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
      icon: 'https://i.mouse.rip/icons/back.png',
      callback: goToPreviousLocation,
      class: 'mh-improved-better-travel-menu-item mh-improved-better-travel-previous-location',
    });
  }

  // add the custom submenu items
  for (const region of otherRegions) {
    if (region.id === currentLocation) {
      return;
    }

    // only add the region if it's not there already.
    if (document.querySelector(`#custom-submenu-item-better-travel-${region.id}`)) {
      return;
    }

    addSubmenuItem({
      id: `better-travel-${region.id}`,
      menu: 'travel',
      label: region.name,
      icon: region.image,
      callback: () => travelTo(region.id),
      class: 'mh-improved-better-travel-menu-item mh-improved-better-travel-region-location',
    });
  }

  const favorites = getLocationFavorites();
  if (favorites && favorites.length > 0) {
    addSubmenuDivider('travel', 'mh-improved-better-travel-favorites-divider');

    favorites.forEach((favorite) => {
      const favoriteRegion = environments.find((environment) => {
        return environment.id === favorite;
      });

      if (favoriteRegion) {
        addSubmenuItem({
          id: `better-travel-favorite-${favorite}`,
          menu: 'travel',
          label: favoriteRegion.name,
          icon: favoriteRegion.image,
          callback: () => travelTo(favoriteRegion.id),
          class: 'mh-improved-better-travel-menu-item mh-improved-better-travel-favorite-location',
        });
      }
    });
  }
};

/**
 * Add a reminder to the travel page.
 */
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

/**
 * Initialize the Simple Travel tab.
 */
const initSimpleTab = () => {
  if ('simple-travel' === getCurrentTab()) {
    const isActive = document.querySelector('.mousehuntHud-page-tabContent.simple-travel');
    if (! isActive || (isActive && isActive.classList.contains('active'))) {
      return;
    }

    setTab('simple-travel');
  }
};

/**
 * Change the tab to Simple Travel if the setting is enabled.
 */
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

/**
 * Highlight the region where the Relic Hunter is.
 */
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

/**
 * Add the Relic Hunter to the map.
 */
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

const addFriendsToMap = () => {
  const travelData = getTravelPageData();
  if (! travelData) {
    return;
  }

  const environments = document.querySelectorAll('.travelPage-map-image-environment');
  if (! environments) {
    return;
  }

  // travelpageData is an array, but we want to flatten the environments property of each object into a single array
  // so we can easily check if the current environment is in the list of friends
  const envData = {};
  travelData.forEach((region) => {
    region.environments.forEach((environment) => {
      if (environment?.type) {
        envData[environment.type] = {
          friends: Number.parseInt(environment.num_friends.replaceAll(',', ''), 10) || 0,
          hunters: Number.parseInt(environment.num_hunters.replaceAll(',', ''), 10) || 0,
        };
      }
    });
  });

  environments.forEach((environment) => {
    const environmentType = environment.getAttribute('data-environment-type');
    if (! environmentType) {
      return;
    }

    const existingWrapper = environment.querySelector('.map-environment-friends-hunters');
    if (existingWrapper) {
      existingWrapper.remove();
    }

    const wrapper = makeElement('div', 'map-environment-friends-hunters', '');

    const friends = envData[environmentType]?.friends || 0;
    const hunters = envData[environmentType]?.hunters || 0;

    makeElement('div', 'map-environment-friends', `${friends.toLocaleString()} friend${friends > 1 || friends === 0 ? 's' : ''}`, wrapper);
    makeElement('div', 'map-environment-hunters', `${hunters.toLocaleString()} hunter${hunters > 1 || hunters === 0 ? 's' : ''}`, wrapper);

    environment.append(wrapper);
  });
};

/**
 * Update the map view of the travel page.
 */
const maybeDoMapView = () => {
  if ('travel' !== getCurrentPage()) {
    return;
  }

  if ('map' !== getCurrentTab()) {
    return;
  }

  expandTravelRegions();
  addRhToMap();
  if (getSetting('better-travel.show-friends-on-map', true)) {
    addFriendsToMap();
  }
};

let _tabHandler = null;

/**
 * Listen for tab changes and update the map view.
 */
const listenTabChange = () => {
  if (_tabHandler) {
    return;
  }

  if (! hg?.utils?.PageUtil?.onclickPageTabHandler) {
    return;
  }

  _tabHandler = hg.utils.PageUtil.onclickPageTabHandler;

  /**
   * Handle tab changes.
   *
   * @param {string} tab The tab to switch to.
   */
  hg.utils.PageUtil.onclickPageTabHandler = (tab) => {
    _tabHandler(tab);
    maybeDoMapView();
  };
};

/**
 * Save the current location so that we can reference it later as the previous location.
 */
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

/**
 * Get the travel favorites.
 *
 * @return {Array} The travel favorites.
 */
const getLocationFavorites = () => {
  return getSetting('better-travel.favorites', []);
};

/**
 * Check if a location is a favorite.
 *
 * @param {string} type The location type.
 *
 * @return {boolean} Whether or not the location is a favorite.
 */
const isLocationFavorite = (type) => {
  return getLocationFavorites().includes(type);
};

/**
 * Save the travel favorites.
 *
 * @param {Array} favorites The travel favorites.
 */
const saveLocationFavorites = (favorites) => {
  saveTravelSetting('favorites', favorites);
};

/**
 * Add a location to the favorites.
 *
 * @param {string} type The location type.
 */
const addToLocationFavorites = (type) => {
  if (! isLocationFavorite(type)) {
    const faves = getLocationFavorites();
    faves.push(type);
    saveLocationFavorites(faves);
  }
};

/**
 * Remove a location from the favorites.
 *
 * @param {string} type The location type.
 */
const removeFromLocationFavorites = (type) => {
  if (getLocationFavorites()) {
    const faves = getLocationFavorites();
    faves.splice(faves.indexOf(type), 1);
    saveLocationFavorites(faves);
  }
};

/**
 * Add favorite buttons to the travel page for each location.
 */
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
    const isEventLocation = eventEnvironments.find((environment) => {
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
      /**
       * Callback for when the favorite button is clicked.
       */
      onActivate: () => {
        addToLocationFavorites(type);
        addToTravelDropdown();
      },
      /**
       * Callback for when the favorite button is deactivated.
       */
      onDeactivate: () => {
        removeFromLocationFavorites(type);
        removeSubmenuItem(type);
      },
    });
  });
};

let travelPageData;

const getTravelPageData = () => {
  return travelPageData || sessionGet('better-travel-page-data', []);
};

const saveTravelPageData = (data) => {
  if (Array.isArray(data?.page?.tabs) && data.page.tabs.length >= 1 && data.page.tabs[0]?.type === 'map' && data.page.tabs[0]?.regions) {
    travelPageData = data.page.tabs[0].regions;
    sessionGet('better-travel-page-data', travelPageData);
  }
};

/**
 * Main function.
 */
const main = () => {
  if (getSetting('better-travel.travel-window', true)) {
    travelWindow();
  }

  onNavigation(() => {
    addSimpleTravel();
    addRhToSimpleTravel();
    addFavoriteButtonsToTravelPage();
  }, {
    page: 'travel',
  });

  onPageChange({
    travel: { show: maybeSetTab },
  });

  onRequest('pages/page.php', (resp) => {
    saveTravelPageData(resp);
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
let eventEnvironments = [];

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
  eventEnvironments = await getData('environments-events');

  main();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-travel',
  name: 'Better Travel',
  type: 'better',
  default: true,
  description: 'Add locations in the current region to the Travel dropdown menu, include a “Simple Travel” tab with a grid of locations, offer an optional alphabetized list, and indicate where the Relic Hunter is.',
  load: init,
  settings,
};
