import { addUIStyles } from '../../utils';
import styles from './styles.css';

import getMousoleumText from './location/mousoleum';
import getToxicSpillText from './location/toxic-spill';
import getFortRoxText from './location/fort-rox';
import { getFieryWarpathText, setFieryWarpathData } from './location/fiery-warpath';
import getLivingGardenText from './location/living-garden';
import getLostCityText from './location/lost-city';
import getSandDunesText from './location/sand-dunes';
import getSeasonalGardenText from './location/seasonal-garden';
import getZugzwangTowerText from './location/zugzwang-tower';
import getIcebergText from './location/iceberg';
import getSunkenCityText from './location/sunken-city';
import getQuesoGeyserText from './location/queso-geyser';
import getLabyrinthText from './location/labyrinth';
import getZokorText from './location/zokor';
import getMoussuPicchuText from './location/moussu-picchu';
import getFloatingIslandsText from './location/floating-islands';
import getForewordFarmText from './location/foreword-farm';
import getTableOfContentsText from './location/table-of-contents';
import getBurroughsRiftText from './location/burroughs-rift';
import getWhiskerWoodsRiftText from './location/whisker-woods-rift';
import getFuromaRiftText from './location/furoma-rift';
import getBristleWoodsRiftText from './location/bristle-woods-rift';
import getValourRiftText from './location/valour-rift';


const cacheLocationData = async () => {
  return new Promise((resolve) => {
    if (! user.environment_type || ! user.quests) {
      return;
    }

    // For some environments, we need to build the data from the quests.
    if (user.environment_type === 'desert_warpath') {
      user.quests.QuestFieryWarpath = setFieryWarpathData();
    }

    // Get the current cached quests.
    const questsCached = JSON.parse(localStorage.getItem('mh-quests-cache')) || {};

    // Combine the cached quests with the current quests.
    const questsCombined = Object.assign({}, questsCached, user.quests);

    // Save the combined data to localStorage.
    localStorage.setItem('mh-quests-cache', JSON.stringify(questsCombined));

    resolve();
  });
};

const travel = async (location) => {
  // return a promise that resolves when the travel is complete.
  return new Promise((resolve) => {
    app.pages.TravelPage.travel(location);

    cacheLocationData(app.data).then(() => {
      resolve();
    });
  });
};

const refreshData = async () => {
  // Add the overlay while we're traveling.
  const overlay = document.querySelector('#overlayBg');
  if (overlay) {
    overlay.classList.add('active');
  }

  // Save the current location so we can return to it.
  if (! user.environment_type) {
    return;
  }

  const currentLocation = user.environment_type;

  const locations = [
    'mousoleum',
    'pollution_outbreak',
    'fort_rox',
    'desert_warpath',
    'desert_oasis',
    'lost_city',
    'sand_dunes',
    'seasonal_garden',
    'zugzwang_tower',
    'iceberg',
    'sunken_city',
    'queso_geyser',
    'labyrinth',
    'ancient_city',
    'moussu_picchu',
    'floating_islands',
    'foreword_farm',
    'table_of_contents',
    'rift_burroughs',
    'rift_whisker_woods',
    'rift_furoma',
    'rift_bristle_woods',
    'rift_valour',
  ];

  locations.forEach(async (location) => {
    await travel(location);
  });

  // Return to the original location and remove the overlay.
  app.pages.TravelPage.travel(currentLocation);
  overlay.classList.remove('active');
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
  });

  makeElement('span', '', 'Dashboard', menuTab);
  makeElement('div', 'arrow', '', menuTab);

  const dropdownContent = document.createElement('div');
  dropdownContent.classList.add('dropdownContent');

  const contents = getDashboardContents();
  dropdownContent.appendChild(contents);

  // Append menu tab dropdown to menu tab.
  menuTab.appendChild(dropdownContent);

  // Refresh button.
  const refreshButton = document.createElement('button');
  refreshButton.classList.add('mousehuntActionButton', 'dashboardRefresh');
  refreshButton.addEventListener('click', refreshData);

  const refreshText = document.createElement('span');
  refreshText.innerText = 'Refresh';

  refreshButton.appendChild(refreshText);

  // Append refresh button to dropdown.
  dropdownContent.appendChild(refreshButton);

  // Append as the second to last tab.
  tabsContainer.insertBefore(menuTab, tabsContainer.lastChild);
};

const makeRegionMarkup = (name, childContent, appendTo) => {
  // Make wrapper.
  const regionWrapper = makeElement('div', 'regionWrapper');

  // Name.
  makeElement('div', 'regionName', name, regionWrapper);

  // Child content.
  regionWrapper.appendChild(childContent);

  appendTo.appendChild(regionWrapper);
};

const makeLocationMarkup = (id, name, progress, appendTo) => {
  const locationWrapper = makeElement('div', 'locationWrapper');

  // Name & travel links
  const locationName = makeElement('div', 'locationName');
  makeElement('span', '', name, locationName);

  const travelLink = makeElement('a', 'travelLink', 'Travel', locationName);
  travelLink.setAttribute('environtment_type', id);

  locationWrapper.appendChild(locationName);

  makeElement('div', 'locationProgress', progress(quests), locationWrapper);

  appendTo.appendChild(locationWrapper);
};

const getDashboardContents = () => {
  const contentsWrapper = document.createElement('div');
  contentsWrapper.classList.add('dashboardContents');

  const burroughs = document.createElement('div');
  makeLocationMarkup('mousoleum', 'Mousoleum', getMousoleumText, burroughs);
  // makeLocationMarkup('pollution_outbreak', 'Toxic Spill', getToxicSpillText, burroughs);
  makeRegionMarkup('Burroughs', burroughs, contentsWrapper);

  const varmintValley = document.createElement('div');
  makeLocationMarkup('fort_rox', 'Fort Rox', getFortRoxText, varmintValley);
  makeRegionMarkup('Varmint Valley', varmintValley, contentsWrapper);

  const sandtailDesert = document.createElement('div');
  makeLocationMarkup('desert_warpath', 'Fiery Warpath', getFieryWarpathText, sandtailDesert);
  // makeLocationMarkup('desert_oasis', 'Living Garden', getLivingGardenText, sandtailDesert);
  // makeLocationMarkup('lost_city', 'Lost City', getLostCityText, sandtailDesert);
  // makeLocationMarkup('sand_dunes', 'Sand Dunes', getSandDunesText, sandtailDesert);
  makeRegionMarkup('Sandtail Desert', sandtailDesert, contentsWrapper);

  const rodentia = document.createElement('div');
  // makeLocationMarkup('seasonal_garden', 'Seasonal Garden', getSeasonalGardenText, rodentia);
  // makeLocationMarkup('zugzwang_tower', 'Zugzwang\'s Tower', getZugzwangTowerText, rodentia);
  makeLocationMarkup('iceberg', 'Iceberg', getIcebergText, rodentia);
  // makeLocationMarkup('sunken_city', 'Sunken City', getSunkenCityText, rodentia);
  makeRegionMarkup('Rodentia', rodentia, contentsWrapper);

  const quesoCanyon = document.createElement('div');
  makeLocationMarkup('queso_geyser', 'Queso Geyser', getQuesoGeyserText, quesoCanyon);
  makeRegionMarkup('Queso Canyon', quesoCanyon, contentsWrapper);

  const hollowHeights = document.createElement('div');
  // makeLocationMarkup('labyrinth', 'Labyrinth', getLabyrinthText, hollowHeights);
  makeLocationMarkup('ancient_city', 'Zokor', getZokorText, hollowHeights);
  // makeLocationMarkup('moussu_picchu', 'Moussu Picchu', getMoussuPicchuText, hollowHeights);
  // makeLocationMarkup('floating_islands', 'Floating Islands', getFloatingIslandsText, hollowHeights);
  makeRegionMarkup('Hollow Heights', hollowHeights, contentsWrapper);

  // const folkloreForest = document.createElement('div');
  // makeLocationMarkup('foreword_farm', 'Foreword Farm', getForewordFarmText, folkloreForest);
  // makeLocationMarkup('table_of_contents', 'Table of Contents', getTableOfContentsText, folkloreForest);
  // makeRegionMarkup('Folklore Forest', folkloreForest, contentsWrapper);

  const rift = document.createElement('div');
  makeLocationMarkup('rift_burroughs', 'Burroughs Rift', getBurroughsRiftText, rift);
  makeLocationMarkup('rift_whisker_woods', 'Whisker Woods Rift', getWhiskerWoodsRiftText, rift);
  // makeLocationMarkup('rift_furoma', 'Furoma Rift', getFuromaRiftText, rift);
  makeLocationMarkup('rift_bristle_woods', 'Bristle Woods Rift', getBristleWoodsRiftText, rift);
  // makeLocationMarkup('rift_valour', 'Valour Rift', getValourRiftText, rift);
  makeRegionMarkup('Rift', rift, contentsWrapper);

  return contentsWrapper;
};

const quests = JSON.parse(localStorage.getItem('mh-quests-cache')) || {};

export default () => {
  // Cache the quest data for our current location.
  cacheLocationData();
  onAjaxRequest(cacheLocationData, 'managers/ajax/turns/activeturn.php');

  makeDashboardTab();

  addUIStyles(styles);
};
