import {
  addStyles,
  createPopup,
  dataGet,
  dataSet,
  debug,
  debuglog,
  doEvent,
  getData,
  isUserTitleAtLeast,
  makeElement,
  makeMhButton,
  onEvent,
  onRequest,
  sessionSet,
  sleep,
  travelTo
} from '@utils';

import styles from './styles.css';

import { getFieryWarpathText, setFieryWarpathData } from './locations/desert-warpath';
import { getSeasonalGardenText, setSeasonalGardenData } from './locations/seasonal-garden';
import { getZugzwangTowerText, setZugzwangTowerData } from './locations/zugzwang-tower';
import getAfterwordAcresText from './locations/afterword-acres';
import getBountifulBeanstalkText from './locations/bountiful-beanstalk';
import getBristleWoodsRiftText from './locations/rift-bristle-woods';
import getBurroughsRiftText from './locations/rift-burroughs';
import getCeruleanSkyportText from './locations/cerulean-skyport';
import getConclusionCliffsText from './locations/conclusion-cliffs';
import getDraconicDepthsText from './locations/draconic-depths';
import getEpilogueFallsText from './locations/epilogue-falls';
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
 * The dashboard locations, grouped by region. Locations with a condition are
 * only shown when it returns true for the cached quest data.
 */
const dashboardLocations = [
  {
    region: 'Burroughs',
    locations: [
      { id: 'mousoleum', name: 'Mousoleum', getText: getMousoleumText },
      { id: 'pollution_outbreak', name: 'Toxic Spill', getText: getToxicSpillText },
    ],
  },
  {
    region: 'Varmint Valley',
    locations: [
      { id: 'fort_rox', name: 'Fort Rox', getText: getFortRoxText },
    ],
  },
  {
    region: 'Sandtail Desert',
    locations: [
      { id: 'desert_warpath', name: 'Fiery Warpath', getText: getFieryWarpathText },
      { id: 'desert_oasis', name: 'Living Garden', getText: getLivingGardenText },
      { id: 'lost_city', name: 'Lost City', getText: getLostCityText },
      { id: 'sand_dunes', name: 'Sand Dunes', getText: getSandDunesText },
    ],
  },
  {
    region: 'Rodentia',
    locations: [
      { id: 'zugzwang_tower', name: 'Zugzwang\'s Tower', getText: getZugzwangTowerText, condition: (quests) => quests?.QuestZugzwangTower?.amp >= 1 },
      { id: 'seasonal_garden', name: 'Seasonal Garden', getText: getSeasonalGardenText, condition: (quests) => ! (quests?.QuestZugzwangTower?.amp >= 1) },
      { id: 'iceberg', name: 'Iceberg', getText: getIcebergText },
      { id: 'sunken_city', name: 'Sunken City', getText: getSunkenCityText },
    ],
  },
  {
    region: 'Queso Canyon',
    locations: [
      { id: 'queso_geyser', name: 'Queso Geyser', getText: getQuesoGeyserText },
    ],
  },
  {
    region: 'Hollow Heights',
    locations: [
      { id: 'labyrinth', name: 'Labyrinth', getText: getLabyrinthText },
      { id: 'ancient_city', name: 'Zokor', getText: getZokorText },
      { id: 'moussu_picchu', name: 'Moussu Picchu', getText: getMoussuPicchuText },
      { id: 'floating_islands', name: 'Floating Islands', getText: getFloatingIslandsText },
      { id: 'cerulean_skyport', name: 'Cerulean Skyport', getText: getCeruleanSkyportText },
    ],
  },
  {
    region: 'Folklore Forest',
    locations: [
      { id: 'bountiful_beanstalk', name: 'Bountiful Beanstalk', getText: getBountifulBeanstalkText },
      { id: 'foreword_farm', name: 'Foreword Farm', getText: getForewordFarmText },
      { id: 'table_of_contents', name: 'Table of Contents', getText: getTableOfContentsText },
      { id: 'school_of_sorcery', name: 'School of Sorcery', getText: getSchoolOfSorceryText },
      { id: 'draconic_depths', name: 'Draconic Depths', getText: getDraconicDepthsText },
      { id: 'afterword_acres', name: 'Afterword Acres', getText: getAfterwordAcresText },
      { id: 'epilogue_falls', name: 'Epilogue Falls', getText: getEpilogueFallsText },
      { id: 'conclusion_cliffs', name: 'Conclusion Cliffs', getText: getConclusionCliffsText },
    ],
  },
  {
    region: 'Rift',
    locations: [
      { id: 'rift_burroughs', name: 'Burroughs Rift', getText: getBurroughsRiftText },
      { id: 'rift_whisker_woods', name: 'Whisker Woods Rift', getText: getWhiskerWoodsRiftText },
      { id: 'rift_furoma', name: 'Furoma Rift', getText: getFuromaRiftText },
      { id: 'rift_bristle_woods', name: 'Bristle Woods Rift', getText: getBristleWoodsRiftText },
      { id: 'rift_valour', name: 'Valour Rift', getText: getValourRiftText },
    ],
  },
];

/**
 * Cache the location data for the current location.
 */
const cacheLocationData = async () => {
  await sleep(300);
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
  const questsCached = await dataGet('quests', {});

  // Combine the cached quests with the current quests. The game reports
  // quests for other locations as false or empty once you've left, so keep
  // the last-known cached data instead of letting those wipe it.
  const questsCombined = Object.assign({}, questsCached, user.quests);
  for (const [questKey, questValue] of Object.entries(user.quests)) {
    const isEmpty = ! questValue || (typeof questValue === 'object' && Object.keys(questValue).length === 0);
    if (isEmpty && questsCached[questKey]) {
      questsCombined[questKey] = questsCached[questKey];
    }
  }

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
    await dataSet('quests', questsCombined);
  } catch (error) {
    debug('Error saving dashboard data.', error);
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
 * Refresh the location data.
 */
const doLocationRefresh = async () => {
  const locationProgress = [];

  const environmentsToUse = new Set(dashboardLocations.flatMap((region) => region.locations.map((location) => location.id)));

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
      <img class="locationImage" src="${env.image}" alt="${env.name}" title="${env.name}" />
    </div>
    <div class="locationName" title="Travel to ${env.name}">
      <div class="name">${env.name}</div>
      <div class="progress"></div>
    </div>
    </div>`;

    locationProgress.push(env.id);
    debug(`Adding ${env.name} to the to-travel list.`);
  });

  createPopup({
    title: 'Update Location Data',
    content: `<div class="mh-improved-location-refresh-popup">
    <div class="mh-improved-location-refresh-popup-progress">${locationProgressMarkup}</div>
    </div>`,
    hasCloseButton: false,
    show: true,
  });

  const originalLocation = user.environment_type;
  debug(`Original location: ${user.environment_type}.`);

  const originalLocationEl = document.querySelector(`.location-refresh-item[data-environment-type="${originalLocation}"]`);
  if (originalLocationEl) {
    originalLocationEl.classList.add('starting');
  }

  for (const location of locationProgress) {
    const locationData = environments.find((env) => env.id === location);
    if (! locationData) {
      continue;
    }

    const progressItem = document.querySelector(`.location-refresh-item[data-environment-type="${location}"]`);
    if (! progressItem) {
      continue;
    }

    const item = progressItem.querySelector('.locationName');
    if (! item) {
      return;
    }

    makeMhButton({
      text: 'Travel',
      size: 'small',
      element: 'button',
      className: ['travel-button', 'lightBlue'],
      callback: async (event) => {
        const button = event.currentTarget;

        sessionSet('doing-location-refresh', true);

        progressItem.classList.add('traveling');
        button.classList.add('busy');

        await waitForTravel(location);
        await sleep(1000);
        await cacheLocationData();

        button.classList.remove('busy');
        progressItem.classList.remove('traveling');
        progressItem.classList.add('done');

        sessionSet('doing-location-refresh', false);
      },
      appendTo: item,
    });
  }

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
  const menuTab = makeElement('div', ['menuItem', 'dropdown', 'dashboard']);

  // Register click event listener.
  menuTab.addEventListener('click', async () => {
    menuTab.classList.toggle('expanded');

    // When opening dashboard
    if (menuTab.classList.contains('expanded')) {
      const dashboardWrapper = document.querySelector('.dashboardWrapper');
      if (! dashboardWrapper) {
        return;
      }

      const existing = document.querySelector('.dashboardContents');
      if (existing) {
        const refreshedContents = await getDashboardContents();
        existing.replaceWith(refreshedContents);

        // Use existing cached data immediately
        // Then update in background
        setTimeout(async () => {
          await cacheLocationData();
          const newRefreshedContents = await getDashboardContents();
          const currentContents = document.querySelector('.dashboardContents');
          if (currentContents) {
            currentContents.replaceWith(newRefreshedContents);
          }
        }, 0);
      } else {
        // First time opening - show cached data immediately
        const dashboardContents = await getDashboardContents();
        const refreshWrapper = dashboardWrapper.querySelector('.refreshWrapper');
        if (refreshWrapper) {
          refreshWrapper.before(dashboardContents);
          refreshWrapper.classList.remove('hidden');
        } else {
          dashboardWrapper.append(dashboardContents);
        }

        // Then update with current location data in background
        setTimeout(async () => {
          await cacheLocationData();
          const refreshedContents = await getDashboardContents();
          const currentContents = document.querySelector('.dashboardContents');
          if (currentContents) {
            currentContents.replaceWith(refreshedContents);
          }
        }, 100);
      }
    }

    sessionSet('doing-location-refresh', false);
  });

  makeElement('span', '', 'Dashboard', menuTab);
  makeElement('div', 'arrow', '', menuTab);

  const dropdownContent = makeElement('div', 'dropdownContent');
  const dashboardWrapper = makeElement('div', 'dashboardWrapper');

  // Refresh button.
  const refreshWrapper = makeElement('div', ['refreshWrapper', 'hidden']);

  makeMhButton({
    text: 'Refresh',
    element: 'button',
    className: ['dashboardRefresh'],
    size: 'small',
    callback: doLocationRefresh,
    appendTo: refreshWrapper,
  });

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
  if (environment?.image) {
    const locationImage = makeElement('img', 'locationImage');
    locationImage.setAttribute('src', environment.image);

    locationImageWrapper.append(locationImage);
  }

  if (environment?.id) {
    locationImageWrapper.addEventListener('click', async () => {
      travelTo(environment.id);
    });
  }

  locationWrapper.append(locationImageWrapper);

  const nameEl = makeElement('div', 'locationName', name);

  if (environment?.id) {
    nameEl.addEventListener('click', async () => {
      travelTo(environment.id);
    });
  }

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
  const quests = await dataGet('quests', {});

  debuglog('location-dashboard', 'quests', quests);

  const contentsWrapper = makeElement('div', 'dashboardContents');

  let hasContent = false;
  for (const region of dashboardLocations) {
    const regionContents = document.createElement('div');

    for (const location of region.locations) {
      if (location.condition && ! location.condition(quests)) {
        continue;
      }

      makeLocationMarkup(location.id, location.name, location.getText, regionContents, quests);
    }

    if (regionContents.children.length > 0) {
      hasContent = true;
    }

    makeRegionMarkup(region.region, regionContents, contentsWrapper);
  }

  if (! hasContent) {
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
  type: 'locations-maps-travel',
  default: true,
  description: 'View location HUD information in a dashboard available in the top dropdown menu.',
  load: init,
};
