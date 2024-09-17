import {
  addStyles,
  cacheGet,
  cacheSet,
  createPopup,
  debug,
  debuglog,
  doEvent,
  getData,
  isUserTitleAtLeast,
  makeElement,
  onEvent,
  onRequest,
  sessionSet,
  travelTo
} from '@utils';

import styles from './styles.css';

import { getFieryWarpathText, setFieryWarpathData } from './locations/desert-warpath';
import { getSeasonalGardenText, setSeasonalGardenData } from './locations/seasonal-garden';
import { getZugzwangTowerText, setZugzwangTowerData } from './locations/zugzwang-tower';
import getBountifulBeanstalkText from './locations/bountiful-beanstalk';
import getBristleWoodsRiftText from './locations/rift-bristle-woods';
import getBurroughsRiftText from './locations/rift-burroughs';
import getFloatingIslandsText from './locations/floating-islands';
import getForewordFarmText from './locations/foreword-farm';
import getFortRoxText from './locations/fort-rox';
import getFuromaRiftText from './locations/rift-furoma';
import getIcebergText from './locations/iceberg';
import getLabyrinthText from './locations/labyrinth';
import getLivingGardenText from './locations/desert-oasis';
import getLostCityText from './locations/lost-city';
import getMousoleumText from './locations/mousoleum';
import getMoussuPicchuText from './locations/moussu-picchu';
import getQuesoGeyserText from './locations/queso-geyser';
import getSandDunesText from './locations/sand-dunes';
import getSchoolOfSorceryText from './locations/school-of-sorcery';
import getSunkenCityText from './locations/sunken-city';
import getTableOfContentsText from './locations/table-of-contents';
import getToxicSpillText from './locations/pollution-outbreak';
import getValourRiftText from './locations/rift-valour';
import getWhiskerWoodsRiftText from './locations/whisker-woods-rift';
import getZokorText from './locations/ancient-city';

/**
 * Cache the location data for the current location.
 */
const cacheLocationData = async () => {
  if (! user.environment_type || ! user.quests) {
    return;
  }

  // For some environments, we need to build the data from the quests.
  if (user.environment_type === 'desert_warpath') {
    const fwQuestData = setFieryWarpathData();
    if (fwQuestData) {
      user.quests.QuestFieryWarpath = fwQuestData;
    }
  } else if (user.environment_type === 'zugzwang_tower') {
    const ztQuestData = setZugzwangTowerData();
    if (ztQuestData) {
      user.quests.QuestZugzwangTower = ztQuestData;
    }
  } else if (user.environment_type === 'seasonal_garden') {
    const sgQuestData = setSeasonalGardenData();
    if (sgQuestData) {
      user.quests.QuestSeasonalGarden = sgQuestData;
    }
  }

  // Get the current cached quests.
  const questsCached = await cacheGet('quests', {});

  // Combine the cached quests with the current quests.
  const questsCombined = Object.assign({}, questsCached, user.quests);

  if (user.environment_type === 'labyrinth') {
    questsCombined.QuestAncientCity = {};
  } else if (user.environment_type === 'ancient_city') {
    questsCombined.QuestLabyrinth = {};
  } else if (user.environment_type === 'zugzwang_tower') {
    questsCombined.QuestSeasonalGarden = {};
  } else if (user.environment_type === 'seasonal_garden') {
    questsCombined.QuestZugzwangTower = {};
  }

  // Save the combined data to localStorage.
  try {
    cacheSet('quests', questsCombined);
  } catch (error) {
    debug('Error saving location data to localStorage:', error);
  }
};

/**
 * Travel to a location and wait for the travel to complete.
 *
 * @param {string} environment The environment to travel to.
 *
 * @return {Promise} A promise that resolves when the travel is complete.
 */
const waitForTravel = async (environment) => {
  return new Promise((resolve) => {
    hg.utils.User.travel(
      environment,
      (success) => {
        debug(`Travel success: ${success}`);
        resolve();
      },
      (error) => {
        debug(`Travel error: ${error}`);
        resolve();
      }
    );

    debug(`Traveled to ${environment}.`);
  });
};

/**
 * Disarm the bait.
 *
 * @return {Promise} A promise that resolves when the bait is disarmed.
 */
const disarmBait = async () => {
  return new Promise((resolve) => {
    hg.utils.TrapControl.disarmBait().go(() => {
      resolve();
    }, () => {
      reject();
    });
  });
};

/**
 * Refresh the location data.
 */
const doLocationRefresh = async () => {
  // Show a popup that shows the progress.
  // Travel to each location.
  // Cache the data.
  // Travel back to the original location.
  // Close the popup.
  // Refresh the page.

  sessionSet('doing-location-refresh', true);

  const locationProgress = [];

  const environmentsToUse = new Set([
    'ancient_city',
    'bountiful_beanstalk',
    'desert_warpath',
    'floating_islands',
    'foreword_farm',
    'fort_rox',
    'iceberg',
    'labyrinth',
    'desert_oasis',
    'lost_city',
    'mousoleum',
    'moussu_picchu',
    'pollution_outbreak',
    'queso_geyser',
    'rift_bristle_woods',
    'rift_burroughs',
    'rift_furoma',
    'rift_valour',
    'rift_whisker_woods',
    'sand_dunes',
    'school_of_sorcery',
    'seasonal_garden',
    'sunken_city',
    'table_of_contents',
    'zugzwang_tower',
  ]);

  const environmentsToTravel = environments.filter((env) => {
    return (environmentsToUse.has(env.id) && isUserTitleAtLeast(env.title));
  });

  debug(`Environments to travel: ${environmentsToTravel.map((env) => env.name).join(', ')}`);

  // Sort environments by order
  environmentsToTravel.sort((a, b) => {
    return a.order - b.order;
  });

  debug(`Sorted environments to travel: ${environmentsToTravel.map((env) => env.name).join(', ')}`);

  let locationProgressMarkup = '';
  environmentsToTravel.forEach((env) => {
    locationProgressMarkup += `<div class="location-refresh-item" data-environment-type="${env.id}">
    <div class="locationImageWrapper">
      <img class="locationImage" src="${env.image}">
    </div>
    <div class="locationName">
      <div class="name">${env.name}</div>
      <div class="progress"></div>
    </div>
    </div>`;
    locationProgress.push(env.id);
    debug(`Adding ${env.name} to the to-travel list.`);
  });

  const popup = createPopup({
    title: 'Refreshing Location Data',
    content: `<div class="mh-improved-location-refresh-popup">
    <div class="mh-improved-location-refresh-popup-progress">${locationProgressMarkup}</div>
    </div>`,
    hasCloseButton: false,
    show: true,
  });

  const originalLocation = user.environment_type;
  debug(`Original location: ${user.environment_type}.`);

  const equippedBait = user.bait_item_id || 'disarmed';
  debug(`Equipped bait: ${equippedBait}.`);

  await disarmBait();

  for (const location of locationProgress) {
    if (originalLocation === location) {
      continue;
    }

    const locationData = environments.find((env) => env.id === location);
    if (! locationData) {
      continue;
    }

    debug(`Traveling to ${locationData.name}.`);

    const progressItem = document.querySelector(`.location-refresh-item[data-environment-type="${location}"]`);
    if (! progressItem) {
      continue;
    }

    progressItem.classList.add('traveling');

    await waitForTravel(location);
    await cacheLocationData();

    progressItem.classList.remove('traveling');
    progressItem.classList.add('done');

    debug(`Traveled to ${locationData.name}.`);
  }

  await waitForTravel(originalLocation);
  debug(`Traveled back to ${user.environment_type}.`);

  hg.utils.TrapControl.setBait(equippedBait).go();
  debug(`Re-equipped bait: ${equippedBait}.`);

  popup.hide();

  const dashboardMenu = document.querySelector('.mousehuntHeaderView .menuItem.dropdown.dashboard');
  if (dashboardMenu) {
    // Make sure the dashboard is expanded.
    dashboardMenu.classList.add('expanded');

    const existing = document.querySelector('.dashboardContents');
    if (existing) {
      const refreshedContents = await getDashboardContents();
      existing.replaceWith(refreshedContents);
    }

    const wrapper = document.querySelector('.dashboardWrapper');
    if (wrapper) {
      wrapper.scrollTop = 0;
    }
  }

  sessionSet('doing-location-refresh', false);

  doEvent('travel_complete');
};

/**
 * Build the dashboard tab.
 */
const makeDashboardTab = () => {
  const tabsContainer = document.querySelector('.mousehuntHeaderView-dropdownContainer');
  if (! tabsContainer) {
    return;
  }

  // Create menu tab.
  const menuTab = document.createElement('div');
  menuTab.classList.add('menuItem');
  menuTab.classList.add('dropdown');
  menuTab.classList.add('dashboard');

  // Register click event listener.
  menuTab.addEventListener('click', async () => {
    menuTab.classList.toggle('expanded');

    const existing = document.querySelector('.dashboardContents');
    if (existing) {
      const refreshedContents = await getDashboardContents();
      existing.replaceWith(refreshedContents);
    }

    sessionSet('doing-location-refresh', false);
  });

  makeElement('span', '', 'Dashboard', menuTab);
  makeElement('div', 'arrow', '', menuTab);

  const dropdownContent = makeElement('div', 'dropdownContent');
  const dashboardWrapper = makeElement('div', 'dashboardWrapper');
  makeElement('div', 'dashboardContents', '', dashboardWrapper);

  // Refresh button.
  const refreshWrapper = makeElement('div', 'refreshWrapper');

  const refreshButton = makeElement('button', ['mousehuntActionButton', 'dashboardRefresh']);
  makeElement('span', '', 'Refresh', refreshButton);

  refreshButton.addEventListener('click', () => {
    const confirmPopup = createPopup({
      title: 'Refresh Location Data',
      content: `<div class="mh-improved-location-refresh-confirm-popup">
        <div class="mh-improved-location-refresh-confirm-popup-content">
          <p>This will refresh the location data for all locations by traveling to each location and caching the data.</p>
          <div class="mh-improved-location-refresh-confirm-popup-buttons">
            <div class="mousehuntActionButton mh-improved-location-refresh-confirm-popup-button mh-improved-location-refresh-confirm-popup-button-cancel"><span>Cancel</span></div>
            <div class="mousehuntActionButton mh-improved-location-refresh-confirm-popup-button mh-improved-location-refresh-confirm-popup-button-confirm"><span>Start Traveling</span></div>
          </div>
        </div>
      </div>`,
      className: 'mh-improved-location-refresh-confirm-popup',
      hasCloseButton: false,
      show: true,
    });

    const cancelButton = document.querySelector('.mh-improved-location-refresh-confirm-popup-button-cancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        confirmPopup.hide();
      });
    }

    const confirmButton = document.querySelector('.mh-improved-location-refresh-confirm-popup-button-confirm');
    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        confirmPopup.hide();
        doLocationRefresh();
      });
    }

    doLocationRefresh();
  });

  refreshWrapper.append(refreshButton);

  dashboardWrapper.append(refreshWrapper);
  dropdownContent.append(dashboardWrapper);
  menuTab.append(dropdownContent);

  // Append as the second to last tab.
  tabsContainer.insertBefore(menuTab, tabsContainer.lastChild);
};

/**
 * Create the markup for a region for the dashboard.
 *
 * @param {string}  name         The name of the region.
 * @param {Element} childContent The child content.
 * @param {Element} appendTo     The element to append to.
 */
const makeRegionMarkup = (name, childContent, appendTo) => {
  // find the child of the first div
  const firstChild = childContent.firstChild;
  if (! firstChild) {
    return;
  }

  // Make wrapper.
  const regionWrapper = makeElement('div', 'regionWrapper');

  // Name.
  makeElement('div', 'regionName', name, regionWrapper);

  // Child content.
  regionWrapper.append(childContent);

  appendTo.append(regionWrapper);
};

/**
 * Build the markup for a location.
 *
 * @param {string}   id       The location ID.
 * @param {string}   name     The location name.
 * @param {Function} progress The progress function.
 * @param {Element}  appendTo The element to append to.
 * @param {Object}   quests   The quests object.
 */
const makeLocationMarkup = (id, name, progress, appendTo, quests) => {
  const markup = progress(quests);

  if (! markup) {
    return;
  }

  const locationWrapper = makeElement('div', 'locationWrapper');
  locationWrapper.setAttribute('data-location', id);
  locationWrapper.classList.add(`locationWrapper-${id}`);

  // Name & travel links
  const locationImageWrapper = makeElement('div', 'locationImageWrapper');
  // get the image for the location
  const environment = environments.find((env) => env.id === id);
  if (environment.image) {
    const locationImage = makeElement('img', 'locationImage');
    locationImage.setAttribute('src', environment.image);

    locationImageWrapper.append(locationImage);
  }

  locationImageWrapper.addEventListener('click', async () => {
    travelTo(environment.id);
  });

  locationWrapper.append(locationImageWrapper);

  const nameEl = makeElement('div', 'locationName', name);

  nameEl.addEventListener('click', async () => {
    travelTo(environment.id);
  });

  locationWrapper.append(nameEl);

  makeElement('div', 'locationProgress', markup, locationWrapper);

  appendTo.append(locationWrapper);
};

/**
 * Get the dashboard contents.
 *
 * @return {Element} The dashboard contents.
 */
const getDashboardContents = async () => {
  const quests = await cacheGet('quests', {});

  debuglog('location-dashboard', 'quests', quests);

  const contentsWrapper = document.createElement('div');
  contentsWrapper.classList.add('dashboardContents');

  const burroughs = document.createElement('div');
  makeLocationMarkup('mousoleum', 'Mousoleum', getMousoleumText, burroughs, quests);
  makeLocationMarkup('pollution_outbreak', 'Toxic Spill', getToxicSpillText, burroughs, quests);
  makeRegionMarkup('Burroughs', burroughs, contentsWrapper);

  const varmintValley = document.createElement('div');
  makeLocationMarkup('fort_rox', 'Fort Rox', getFortRoxText, varmintValley, quests);
  makeRegionMarkup('Varmint Valley', varmintValley, contentsWrapper);

  const sandtailDesert = document.createElement('div');
  makeLocationMarkup('desert_warpath', 'Fiery Warpath', getFieryWarpathText, sandtailDesert, quests);
  makeLocationMarkup('desert_oasis', 'Living Garden', getLivingGardenText, sandtailDesert, quests);
  makeLocationMarkup('lost_city', 'Lost City', getLostCityText, sandtailDesert, quests);
  makeLocationMarkup('sand_dunes', 'Sand Dunes', getSandDunesText, sandtailDesert, quests);
  makeRegionMarkup('Sandtail Desert', sandtailDesert, contentsWrapper);

  const rodentia = document.createElement('div');
  makeLocationMarkup('seasonal_garden', 'Seasonal Garden', getSeasonalGardenText, rodentia, quests);
  makeLocationMarkup('zugzwang_tower', 'Zugzwang\'s Tower', getZugzwangTowerText, rodentia, quests);
  makeLocationMarkup('iceberg', 'Iceberg', getIcebergText, rodentia, quests);
  makeLocationMarkup('sunken_city', 'Sunken City', getSunkenCityText, rodentia, quests);
  makeRegionMarkup('Rodentia', rodentia, contentsWrapper);

  const quesoCanyon = document.createElement('div');
  makeLocationMarkup('queso_geyser', 'Queso Geyser', getQuesoGeyserText, quesoCanyon, quests);
  makeRegionMarkup('Queso Canyon', quesoCanyon, contentsWrapper);

  const hollowHeights = document.createElement('div');
  makeLocationMarkup('labyrinth', 'Labyrinth', getLabyrinthText, hollowHeights, quests);
  makeLocationMarkup('ancient_city', 'Zokor', getZokorText, hollowHeights, quests);
  makeLocationMarkup('moussu_picchu', 'Moussu Picchu', getMoussuPicchuText, hollowHeights, quests);
  makeLocationMarkup('floating_islands', 'Floating Islands', getFloatingIslandsText, hollowHeights, quests);
  makeRegionMarkup('Hollow Heights', hollowHeights, contentsWrapper);

  const folkloreForest = document.createElement('div');
  makeLocationMarkup('bountiful_beanstalk', 'Bountiful Beanstalk', getBountifulBeanstalkText, folkloreForest, quests);
  makeLocationMarkup('foreword_farm', 'Foreword Farm', getForewordFarmText, folkloreForest, quests);
  makeLocationMarkup('table_of_contents', 'Table of Contents', getTableOfContentsText, folkloreForest, quests);
  makeLocationMarkup('school_of_sorcery', 'School of Sorcery', getSchoolOfSorceryText, folkloreForest, quests);
  makeRegionMarkup('Folklore Forest', folkloreForest, contentsWrapper);

  const rift = document.createElement('div');
  makeLocationMarkup('rift_burroughs', 'Burroughs Rift', getBurroughsRiftText, rift, quests);
  makeLocationMarkup('rift_whisker_woods', 'Whisker Woods Rift', getWhiskerWoodsRiftText, rift, quests);
  makeLocationMarkup('rift_furoma', 'Furoma Rift', getFuromaRiftText, rift, quests);
  makeLocationMarkup('rift_bristle_woods', 'Bristle Woods Rift', getBristleWoodsRiftText, rift, quests);
  makeLocationMarkup('rift_valour', 'Valour Rift', getValourRiftText, rift, quests);
  makeRegionMarkup('Rift', rift, contentsWrapper);

  if (
    burroughs.children.length === 0 &&
    varmintValley.children.length === 0 &&
    sandtailDesert.children.length === 0 &&
    rodentia.children.length === 0 &&
    quesoCanyon.children.length === 0 &&
    hollowHeights.children.length === 0 &&
    folkloreForest.children.length === 0 &&
    rift.children.length === 0
  ) {
    const noLocation = makeElement('div', 'noLocationDataWrapper');
    makeElement('div', 'noLocationData', 'No location data found. Refresh data to populate the dashboard.', noLocation);
    contentsWrapper.append(noLocation);
  }

  return contentsWrapper;
};

let environments = [];

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'location-dashboard');

  environments = await getData('environments');

  // Cache the quest data for our current location.
  sessionSet('doing-location-refresh', false);

  cacheLocationData();
  onEvent('travel_complete', cacheLocationData);
  onRequest('*', cacheLocationData);

  makeDashboardTab();
};

/**
 * Initialize the module.
 */
export default {
  id: 'location-dashboard',
  name: 'Location Dashboard',
  type: 'feature',
  default: true,
  description: 'View location HUD information in a dashboard available in the top dropdown menu.',
  load: init,
};
