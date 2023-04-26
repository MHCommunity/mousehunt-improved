import { addUIStyles } from '../utils';
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

const locationImages = {
  meadow: 'https://www.mousehuntgame.com/images/environments/a441eb078698da69ef2765983f4b5912.jpg?cv=2',
  town_of_gnawnia: 'https://www.mousehuntgame.com/images/environments/231c9b4d583f98c365efcbbd50fddb76_v2.jpg?cv=2',
  windmill: 'https://www.mousehuntgame.com/images/environments/15623ee3d1cecd303d677e35507b6bb1.jpg?cv=2',
  harbour: 'https://www.mousehuntgame.com/images/environments/299b09242d8fc78cbf208c3241a84f47.jpg?cv=2',
  mountain: 'https://www.mousehuntgame.com/images/environments/dee680c95caf9f8d4f4c8f62d9559c55.jpg?cv=2',
  kings_arms: 'https://www.mousehuntgame.com/images/environments/85b1ef8a33eb3738f99ff6b6ef031b0b.jpg?cv=2',
  tournament_hall: 'https://www.mousehuntgame.com/images/environments/bcef5388cc1ef35263ab0ce4dc25775a.jpg?cv=2',
  kings_gauntlet: 'https://www.mousehuntgame.com/images/environments/c6b49b20bb646760bf6c0ed3068f1295.jpg?cv=2',
  calm_clearing: 'https://www.mousehuntgame.com/images/environments/7767dffc1f500872477a503c3860a0af.jpg?cv=2',
  great_gnarled_tree: 'https://www.mousehuntgame.com/images/environments/ea24e3c7e0318a5ab098139848e43f36.jpg?cv=2',
  lagoon: 'https://www.mousehuntgame.com/images/environments/cfbb19c90443073ff9d14b282c157c90.jpg?cv=2',
  laboratory: 'https://www.mousehuntgame.com/images/environments/34167a825f66074fcc1c2f01018815b9.jpg?cv=2',
  mousoleum: 'https://www.mousehuntgame.com/images/environments/90f0aedc563b86ae9f791f8f1d54e65d.jpg?cv=2',
  town_of_digby: 'https://www.mousehuntgame.com/images/environments/82cc4bd9e80af9968d04e3f353386c39_v2.jpg?cv=2',
  bazaar: 'https://www.mousehuntgame.com/images/environments/52aa280a0470bf2bbf4fcc47248df387.jpg?cv=2',
  pollution_outbreak: 'https://www.mousehuntgame.com/images/environments/6e8c017845d0fac63689aaa807775ab2.jpg?cv=2',
  training_grounds: 'https://www.mousehuntgame.com/images/environments/c4a76adf8dce0b63bc51985821a7df8f.jpg?cv=2',
  dojo: 'https://www.mousehuntgame.com/images/environments/04009d0da06626fec6dde7fbca554e04.jpg?cv=2',
  meditation_room: 'https://www.mousehuntgame.com/images/environments/6abcf1fec4d87fe316c596ddf40c486e.jpg?cv=2',
  pinnacle_chamber: 'https://www.mousehuntgame.com/images/environments/87926031d29e6aefe3fb7ed6c9b26634.jpg?cv=2',
  catacombs: 'https://www.mousehuntgame.com/images/environments/6c90bd8fb85fbbfecb1b15eb191e61a7.jpg?cv=2',
  forbidden_grove: 'https://www.mousehuntgame.com/images/environments/2b093e36c3aadc67b59abc740f194149.jpg?cv=2',
  acolyte_realm: 'https://www.mousehuntgame.com/images/environments/a72f9c94f446eef321d92f25c8617c62.jpg?cv=2',
  cape_clawed: 'https://www.mousehuntgame.com/images/environments/49323d2e691deb0336089fa0be3b9a80.jpg?cv=2',
  elub_shore: 'https://www.mousehuntgame.com/images/environments/35e41632eb8740769d7c3b4fce87d08e.jpg?cv=2',
  nerg_plains: 'https://www.mousehuntgame.com/images/environments/e543aa29b9ddbf8e53b614243c502b37.jpg?cv=2',
  derr_dunes: 'https://www.mousehuntgame.com/images/environments/e2203bda2c17140902aed0a0f8da1515.jpg?cv=2',
  jungle_of_dread: 'https://www.mousehuntgame.com/images/environments/cf9945d59760e180f3c0d77d6f065b71_v2.jpg?cv=2',
  dracano: 'https://www.mousehuntgame.com/images/environments/eefec52373c6cb93bcd55909cb477e47.jpg?cv=2',
  balacks_cove: 'https://www.mousehuntgame.com/images/environments/13f8a9edffc65a052d84dd08d1a0a32b.jpg?cv=2',
  claw_shot_city: 'https://www.mousehuntgame.com/images/environments/d3ace11874ce22faf7b2801b0c57f529.jpg?cv=2',
  train_station: 'https://www.mousehuntgame.com/images/environments/dbbb6f5114d44fefa3870271a8a4b0fe.jpg?cv=2',
  fort_rox: 'https://www.mousehuntgame.com/images/environments/f8fa3cfb0ba47234604e790c0edc51aa.jpg?cv=2',
  desert_warpath: 'https://www.mousehuntgame.com/images/environments/50c140c25725c308d70f14ef96279ab6.jpg?cv=2',
  desert_city: 'https://www.mousehuntgame.com/images/environments/423b8ccbc5788e599320f20f6c20a478.jpg?cv=2',
  desert_oasis: 'https://www.mousehuntgame.com/images/environments/1f78a597ffbc9e1db4dd312d2a510e2d.jpg?cv=2',
  lost_city: 'https://www.mousehuntgame.com/images/environments/aa370a7e75c3baa6db51967c17f6bc90.jpg?cv=2',
  sand_dunes: 'https://www.mousehuntgame.com/images/environments/4e8967692df16dfbb489e9acf672ec4a.jpg?cv=2',
  ss_huntington_ii: 'https://www.mousehuntgame.com/images/environments/2b8b5004d762ad05d5e84a932244a6e0.jpg?cv=2',
  seasonal_garden: 'https://www.mousehuntgame.com/images/environments/49b4059a6789ec3b24b7489be9143c4a.jpg?cv=2',
  zugzwang_tower: 'https://www.mousehuntgame.com/images/environments/08a64629c0ca285a411df8330ede2c11.jpg?cv=2',
  zugzwang_library: 'https://www.mousehuntgame.com/images/environments/3b829c45549a8f953bc96ee34eff66dd.jpg?cv=2',
  slushy_shoreline: 'https://www.mousehuntgame.com/images/environments/83a58b48b1fdbde6f3b14e8a40e04e1f.jpg?cv=2',
  iceberg: 'https://www.mousehuntgame.com/images/environments/11939d9ac30a58d4b923915834764ff0.jpg?cv=2',
  sunken_city: 'https://www.mousehuntgame.com/images/environments/76c845e1cb95684581b12f3c3b1c1c8e.jpg?cv=2',
  queso_river: 'https://www.mousehuntgame.com/images/environments/404207124e79f78d3970df192fae9460.jpg?cv=2',
  queso_plains: 'https://www.mousehuntgame.com/images/environments/b22f0b26343fc87581e3291e41b957ef.jpg?cv=2',
  queso_quarry: 'https://www.mousehuntgame.com/images/environments/04042c67b067e04bc96bf59a05b3c9c3.jpg?cv=2',
  queso_geyser: 'https://www.mousehuntgame.com/images/environments/d0046f985528496b0d638c04f35270bc.jpg?cv=2',
  fungal_cavern: 'https://www.mousehuntgame.com/images/environments/8e2c435efa191b1948f38525664c96ff.jpg?cv=2',
  labyrinth: 'https://www.mousehuntgame.com/images/environments/fde0d810fea36c1bb16af988fa014a1f.jpg?cv=2',
  ancient_city: 'https://www.mousehuntgame.com/images/environments/4439cd721150faa28ff83f8e390dd766.jpg?cv=2',
  moussu_picchu: 'https://www.mousehuntgame.com/images/environments/438e2879c8c1e468f7e7eee169e289b6.jpg?cv=2',
  floating_islands: 'https://www.mousehuntgame.com/images/environments/0fb181c7f216be2d5bde0475ab46f8c5.jpg?cv=2',
  foreword_farm: 'https://www.mousehuntgame.com/images/environments/e473a02469e37bf1d01c0a42188a8609.jpg?cv=2',
  prologue_pond: 'https://www.mousehuntgame.com/images/environments/cd1bbc4c15baca2208f90313c7ef65a4.jpg?cv=2',
  table_of_contents: 'https://www.mousehuntgame.com/images/environments/f48fa15a916ac106efbf4ca6b4be7135.jpg?cv=2',
  rift_gnawnia: 'https://www.mousehuntgame.com/images/environments/632aa670b5358a0bbc2d2c4ef982c6ad.jpg?cv=2',
  rift_burroughs: 'https://www.mousehuntgame.com/images/environments/818f04f2bda88795c67cc6ff227615bb.jpg?cv=2',
  rift_whisker_woods: 'https://www.mousehuntgame.com/images/environments/d5e2069ed820740389a2f4cebbc5657c.jpg?cv=2',
  rift_furoma: 'https://www.mousehuntgame.com/images/environments/67fca617353d1d951d24abea92bce506.jpg?cv=2',
  rift_bristle_woods: 'https://www.mousehuntgame.com/images/environments/3319aacbf12783484718dd1470f2bdb7.jpg?cv=2',
  rift_valour: 'https://www.mousehuntgame.com/images/environments/5d2d00f48fbe41740cfb438f947273ac.jpg?cv=2',
};

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
    }

    // Get the current cached quests.
    const questsCached = JSON.parse(localStorage.getItem('mh-quests-cache')) || {};

    // Combine the cached quests with the current quests.
    const questsCombined = Object.assign({}, questsCached, user.quests);

    if (user.environment_type === 'labyrinth') {
      questsCombined.QuestAncientCity = {};
    } else if (user.environment_type === 'ancient_city') {
      questsCombined.QuestLabyrinth = {};
    }

    // Save the combined data to localStorage.
    localStorage.setItem('mh-quests-cache', JSON.stringify(questsCombined));

    resolve();
  });
};

const travel = async (location) => {
  console.log(`Traveling to ${location}...`);

  // return a promise that resolves when the travel is complete.
  return new Promise((resolve) => {
    // app.pages.TravelPage.travel(location);    // wait a second between travel and refresh.
    cacheLocationData(app.data).then(() => {
      console.log(`Travel complete to ${location}.`);
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

  // Travel to each location, waiting 1 second between each.
  for (let i = 0; i < locations.length; i++) {
    await travel(locations[i]);
  }

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

  // Refresh button.
  const refreshWrapper = document.createElement('div');
  refreshWrapper.classList.add('refreshWrapper');

  const refreshButton = document.createElement('button');
  refreshButton.classList.add('mousehuntActionButton', 'dashboardRefresh');
  refreshButton.addEventListener('click', refreshData);

  const refreshText = document.createElement('span');
  refreshText.innerText = 'Refresh';

  refreshButton.appendChild(refreshText);
  refreshWrapper.appendChild(refreshButton);

  // Append refresh button to dropdown.
  contents.appendChild(refreshWrapper);

  dropdownContent.appendChild(contents);

  // Append menu tab dropdown to menu tab.
  menuTab.appendChild(dropdownContent);

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
  regionWrapper.appendChild(childContent);

  appendTo.appendChild(regionWrapper);
};

const makeLocationMarkup = (id, name, progress, appendTo) => {
  const markup = progress(quests);

  if (! markup) {
    return;
  }

  const locationWrapper = makeElement('div', 'locationWrapper');

  // Name & travel links
  const locationImageWrapper = makeElement('div', 'locationImageWrapper');
  if (locationImages[id]) {
    const locationImage = makeElement('img', 'locationImage');
    locationImage.setAttribute('src', locationImages[id]);

    locationImageWrapper.appendChild(locationImage);
  }

  locationWrapper.appendChild(locationImageWrapper);

  const locationName = makeElement('div', 'locationName');
  makeElement('span', '', name, locationName);

  locationWrapper.appendChild(locationName);

  makeElement('div', 'locationProgress', markup, locationWrapper);

  appendTo.appendChild(locationWrapper);
};

const getDashboardContents = () => {
  const contentsWrapper = document.createElement('div');
  contentsWrapper.classList.add('dashboardContents');

  const burroughs = document.createElement('div');
  makeLocationMarkup('mousoleum', 'Mousoleum', getMousoleumText, burroughs);
  makeLocationMarkup('pollution_outbreak', 'Toxic Spill', getToxicSpillText, burroughs);
  makeRegionMarkup('Burroughs', burroughs, contentsWrapper);

  const varmintValley = document.createElement('div');
  makeLocationMarkup('fort_rox', 'Fort Rox', getFortRoxText, varmintValley);
  makeRegionMarkup('Varmint Valley', varmintValley, contentsWrapper);

  const sandtailDesert = document.createElement('div');
  makeLocationMarkup('desert_warpath', 'Fiery Warpath', getFieryWarpathText, sandtailDesert);
  makeLocationMarkup('desert_oasis', 'Living Garden', getLivingGardenText, sandtailDesert);
  makeLocationMarkup('lost_city', 'Lost City', getLostCityText, sandtailDesert);
  makeLocationMarkup('sand_dunes', 'Sand Dunes', getSandDunesText, sandtailDesert);
  makeRegionMarkup('Sandtail Desert', sandtailDesert, contentsWrapper);

  const rodentia = document.createElement('div');
  makeLocationMarkup('seasonal_garden', 'Seasonal Garden', getSeasonalGardenText, rodentia);
  makeLocationMarkup('zugzwang_tower', 'Zugzwang\'s Tower', getZugzwangTowerText, rodentia);
  makeLocationMarkup('iceberg', 'Iceberg', getIcebergText, rodentia);
  makeLocationMarkup('sunken_city', 'Sunken City', getSunkenCityText, rodentia);
  makeRegionMarkup('Rodentia', rodentia, contentsWrapper);

  const quesoCanyon = document.createElement('div');
  makeLocationMarkup('queso_geyser', 'Queso Geyser', getQuesoGeyserText, quesoCanyon);
  makeRegionMarkup('Queso Canyon', quesoCanyon, contentsWrapper);

  const hollowHeights = document.createElement('div');
  makeLocationMarkup('labyrinth', 'Labyrinth', getLabyrinthText, hollowHeights);
  makeLocationMarkup('ancient_city', 'Zokor', getZokorText, hollowHeights);
  makeLocationMarkup('moussu_picchu', 'Moussu Picchu', getMoussuPicchuText, hollowHeights);
  makeLocationMarkup('floating_islands', 'Floating Islands', getFloatingIslandsText, hollowHeights);
  makeRegionMarkup('Hollow Heights', hollowHeights, contentsWrapper);

  const folkloreForest = document.createElement('div');
  makeLocationMarkup('foreword_farm', 'Foreword Farm', getForewordFarmText, folkloreForest);
  makeLocationMarkup('table_of_contents', 'Table of Contents', getTableOfContentsText, folkloreForest);
  makeRegionMarkup('Folklore Forest', folkloreForest, contentsWrapper);

  const rift = document.createElement('div');
  makeLocationMarkup('rift_burroughs', 'Burroughs Rift', getBurroughsRiftText, rift);
  makeLocationMarkup('rift_whisker_woods', 'Whisker Woods Rift', getWhiskerWoodsRiftText, rift);
  makeLocationMarkup('rift_furoma', 'Furoma Rift', getFuromaRiftText, rift);
  makeLocationMarkup('rift_bristle_woods', 'Bristle Woods Rift', getBristleWoodsRiftText, rift);
  makeLocationMarkup('rift_valour', 'Valour Rift', getValourRiftText, rift);
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
    contentsWrapper.appendChild(noLocation);
  }

  return contentsWrapper;
};

const quests = JSON.parse(localStorage.getItem('mh-quests-cache')) || {};

export default () => {
  // Cache the quest data for our current location.
  cacheLocationData();
  onTravel(null, { callback: cacheLocationData });
  onAjaxRequest(cacheLocationData, 'managers/ajax/turns/activeturn.php');

  makeDashboardTab();

  addUIStyles(styles);
};
