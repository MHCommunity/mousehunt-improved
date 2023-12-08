import { addUIStyles, makeElement, onRequest, onTravel } from '@/utils';

import styles from './styles.css';

import environments from '@data/environments.json';

import { getFieryWarpathText, setFieryWarpathData } from './location/fiery-warpath';
import { getSeasonalGardenText, setSeasonalGardenData } from './location/seasonal-garden';
import { getZugzwangTowerText, setZugzwangTowerData } from './location/zugzwang-tower';
import getBristleWoodsRiftText from './location/bristle-woods-rift';
import getBurroughsRiftText from './location/burroughs-rift';
import getFloatingIslandsText from './location/floating-islands';
import getForewordFarmText from './location/foreword-farm';
import getFortRoxText from './location/fort-rox';
import getFuromaRiftText from './location/furoma-rift';
import getIcebergText from './location/iceberg';
import getLabyrinthText from './location/labyrinth';
import getLivingGardenText from './location/living-garden';
import getLostCityText from './location/lost-city';
import getMousoleumText from './location/mousoleum';
import getMoussuPicchuText from './location/moussu-picchu';
import getQuesoGeyserText from './location/queso-geyser';
import getSandDunesText from './location/sand-dunes';
import getSunkenCityText from './location/sunken-city';
import getTableOfContentsText from './location/table-of-contents';
import getToxicSpillText from './location/toxic-spill';
import getValourRiftText from './location/valour-rift';
import getWhiskerWoodsRiftText from './location/whisker-woods-rift';
import getZokorText from './location/zokor';

const cacheLocationData = async () => {
  return new Promise((resolve) => {
    if (! user.environment_type || ! user.quests) {
      resolve();
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
    const questsCached = JSON.parse(localStorage.getItem('mh-improved-cache-quests')) || {};

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
    localStorage.setItem('mh-improved-cache-quests', JSON.stringify(questsCombined));

    resolve();
  });
};

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
  menuTab.addEventListener('click', () => {
    menuTab.classList.toggle('expanded');

    const existing = document.querySelector('.dashboardContents');
    if (existing) {
      const refreshedContents = getDashboardContents();
      existing.replaceWith(refreshedContents);
    }
  });

  makeElement('span', '', 'Dashboard', menuTab);
  makeElement('div', 'arrow', '', menuTab);

  const dropdownContent = makeElement('div', 'dropdownContent');
  const dashboardWrapper = makeElement('div', 'dashboardWrapper');
  makeElement('div', 'dashboardContents', '', dashboardWrapper);

  // Refresh button.
  const refreshWrapper = makeElement('div', 'refreshWrapper');

  // TODO: remove disabled class when we have a way to refresh.
  const refreshButton = makeElement('button', ['mousehuntActionButton', 'dashboardRefresh', 'disabled']);
  makeElement('span', '', 'Refresh', refreshButton);

  refreshWrapper.append(refreshButton);
  makeElement('div', '', ' (coming soon, for now just travel to each location)', refreshWrapper);

  dashboardWrapper.append(refreshWrapper);
  dropdownContent.append(dashboardWrapper);
  menuTab.append(dropdownContent);

  // Append as the second to last tab.
  tabsContainer.insertBefore(menuTab, tabsContainer.lastChild);
};

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
  const image = environments.find((env) => env.id === id);
  if (image.image) {
    const locationImage = makeElement('img', 'locationImage');
    locationImage.setAttribute('src', image.image);

    locationImageWrapper.append(locationImage);
  }

  locationWrapper.append(locationImageWrapper);

  makeElement('div', 'locationName', name, locationWrapper);
  makeElement('div', 'locationProgress', markup, locationWrapper);

  appendTo.append(locationWrapper);
};

const getDashboardContents = () => {
  const quests = JSON.parse(localStorage.getItem('mh-improved-cache-quests')) || {};

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
  makeLocationMarkup('foreword_farm', 'Foreword Farm', getForewordFarmText, folkloreForest, quests);
  makeLocationMarkup('table_of_contents', 'Table of Contents', getTableOfContentsText, folkloreForest, quests);
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

export default () => {
  // Cache the quest data for our current location.
  cacheLocationData();
  onTravel(null, { callback: cacheLocationData });
  onRequest(cacheLocationData);

  makeDashboardTab();

  addUIStyles(styles);
};
