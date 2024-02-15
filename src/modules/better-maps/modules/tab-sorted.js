import {
  addMHCTData,
  getArEl,
  getData,
  getHighestArForMouse,
  getLocationForMouse,
  getMapData,
  makeElement,
  mapData,
  mapModel,
  showTravelConfirmation,
  showTravelConfirmationNoDetails
} from '@utils';

import { addArToggle, removeArToggle } from './toggle-ar';
import doHighlighting from './highlighting';

import mouseGroups from '@data/map-groups.json';

const getMouseDataForMap = (currentMapData, type = 'mouse') => {
  // Get the unsorted mice.
  let unsortedMice = [];
  if (currentMapData.goals[type]) {
    unsortedMice = currentMapData.goals[type];
  }

  // Get the mice that have been caught from each hunter.
  let caughtMice = [];
  // get the ids from currentMapData.hunters.completed_goal_ids.mouse
  currentMapData.hunters.forEach((hunter) => {
    caughtMice = [...caughtMice, ...hunter.completed_goal_ids[type]];
  });

  // Remove the caught mice from the unsorted mice.
  unsortedMice = unsortedMice.filter((mouse) => {
    return ! caughtMice.includes(mouse.unique_id);
  });

  // Get the categories.
  let categories = [];
  if (mouseGroups[currentMapData.map_type] && mouseGroups[currentMapData.map_type].categories) {
    categories = mouseGroups[currentMapData.map_type].categories;
  }

  let subcategories = [];
  if (mouseGroups[currentMapData.map_type] && mouseGroups[currentMapData.map_type].subcategories) {
    subcategories = mouseGroups[currentMapData.map_type].subcategories;
  }

  return {
    unsortedMice,
    categories,
    subcategories,
    getMouseDataForMap,
  };
};

const makeMouseDiv = async (mouse, type = 'mouse') => {
  // Wrapper.
  const mouseDiv = makeElement('div', 'mouse-container');

  // Wrapper IDs.
  mouseDiv.setAttribute('data-mouse-id', mouse.unique_id);
  mouseDiv.setAttribute('data-mouse-type', mouse.type);
  mouseDiv.setAttribute('data-type', type);

  // Mouse header.
  const mouseData = makeElement('div', 'mouse-data');

  const mouseImage = makeElement('img', 'mouse-image');
  mouseImage.src = 'mouse' === type ? mouse.small : mouse.thumb;
  mouseImage.alt = mouse.name;
  mouseData.append(mouseImage);

  makeElement('div', 'mouse-name', mouse.name, mouseData);

  const mouseAr = await getArEl(mouse.unique_id, type);
  if (mouseAr) {
    mouseData.append(mouseAr);
  }

  // Mouse header close.
  mouseDiv.append(mouseData);

  // Mouse extra info.
  const mouseExtraInfoWrapper = makeElement('div', 'mouse-mhct-extra-info-wrapper');
  const mouseExtraInfo = makeElement('div', 'mouse-extra-info');

  if (Array.isArray(mouse.environment_ids)) {
    // Mouse locations.
    const locationText = makeElement('div', 'location-text-wrapper');
    makeElement('span', 'location-text', 'Found in ', locationText);

    mouse.environment_ids.forEach((environmentID, index) => {
      const environment = mapData().environments.find((env) => env.id === environmentID);

      if (environment) {
        const locationLink = makeElement('a', 'mouse-location-link', environment.name);

        locationLink.title = `Travel to ${environment.name}`;
        locationLink.setAttribute('data-environment-id', environment.id);

        locationLink.addEventListener('click', () => {
          showTravelConfirmationNoDetails(environment);
        });

        // If it's not the first item, append a comma before it
        if (index !== 0) {
          locationText.append(document.createTextNode(', '));
        }

        locationText.append(locationLink);
      }
    });

    mouseExtraInfo.append(locationText);
  }

  // Mouse weakness.
  if (mouse.weaknesses) {
    const weakness = makeElement('div', 'mouse-weakness');

    mouse.weaknesses.forEach((weaknessType) => {
      if (weaknessType.power_types.length === 0) {
        return;
      }

      // Weakness wrapper.
      const weaknessTypeDiv = makeElement('div', 'weakness-type');
      makeElement('div', 'weakness-name', weaknessType.name, weaknessTypeDiv);

      const powerTypes = makeElement('div', 'power-types');
      weaknessType.power_types.forEach((ptype) => {
        const powerType = document.createElement('img');
        powerType.src = `https://www.mousehuntgame.com/images/powertypes/${ptype.name}.png`;
        powerTypes.append(powerType);
      });

      // Weakness wrapper close.
      weaknessTypeDiv.append(powerTypes);
      weakness.append(weaknessTypeDiv);
    });

    // Mouse weakness close.
    mouseExtraInfo.append(weakness);
  }

  // Mouse extra info close.
  mouseExtraInfoWrapper.append(mouseExtraInfo);
  mouseDiv.append(mouseExtraInfoWrapper);

  // Click handler.
  mouseDiv.addEventListener('click', async () => {
    const isSelected = mouseDiv.classList.contains('mouse-container-selected');
    if (isSelected) {
      mouseDiv.classList.remove('mouse-container-selected');
      return;
    }

    // Append MHCT data.
    addMHCTData(mouse, mouseExtraInfo, type);

    // Only allow one mouse to be selected at a time.
    const addClass = ! mouseDiv.classList.contains('mouse-container-selected');

    // Clear all selected.
    const allSelected = document.querySelectorAll('.mouse-container-selected');
    if (allSelected) {
      allSelected.forEach((selected) => {
        selected.classList.remove('mouse-container-selected');
      });
    }

    // Except this one if it's not selected.
    if (addClass) {
      mouseDiv.classList.add('mouse-container-selected');
    }
  });

  return mouseDiv;
};

const makeSortedPageWrapper = () => {
  const sortedPage = makeElement('div', 'sorted-page');
  makeElement('div', ['sorted-loading', 'mousehuntPage-loading', 'active'], '', sortedPage);
  makeElement('div', 'sorted-page-content', '', sortedPage);

  return sortedPage;
};

const makeSortedMiceList = async () => {
  // Get the current map data.
  const currentMapData = getMapData(mapData().map_id);
  const { unsortedMice, categories, subcategories } = getMouseDataForMap(currentMapData);

  const target = document.querySelector('.sorted-page-content');
  if (! target) {
    return;
  }

  const categoriesWrapper = makeElement('div', 'mouse-category-container');

  // Foreach category, create a category wrapper
  for (const category of categories) {
    const categoryID = category.id;

    // Create the category wrapper.
    const categoryWrapper = makeElement('div', 'mouse-category-wrapper');
    categoryWrapper.classList.add(`mouse-category-${categoryID}`, 'mouse-category-wrapper-hidden');

    // Category header.
    const categoryHeader = makeElement('div', 'mouse-category-header');

    if (category.color) {
      categoryWrapper.style.backgroundColor = category.color;
    }

    // Icon, title, and subtitle wrapper.
    const iconTitleWrapper = makeElement('div', 'mouse-category-icon-title-wrapper');

    if (category.icon) {
      const categoryIcon = makeElement('img', 'mouse-category-icon');

      // if the string starts with a /, then it's a relative path, otherwise it's a full path
      categoryIcon.src = (category.icon.indexOf('/') === 0) ? `https://www.mousehuntgame.com/images${category.icon}` : category.icon;

      iconTitleWrapper.append(categoryIcon);
    }

    // Title, icon, and subtitle wrapper.
    const iconTitleTitleWrapper = makeElement('div', 'mouse-category-icon-title-title-wrapper');

    makeElement('div', 'mouse-category-title', category.name, iconTitleTitleWrapper);
    makeElement('div', 'mouse-category-subtitle', category.subtitle, iconTitleTitleWrapper);

    // Title, icon, and subtitle wrapper close.
    iconTitleWrapper.append(iconTitleTitleWrapper);

    // Category header close.
    categoryHeader.append(iconTitleWrapper);

    // Category wrapper close.
    categoryWrapper.append(categoryHeader);

    // Mice in category.
    const categoryMice = makeElement('div', 'mouse-category-mice');

    const addToSubCat = [];

    // loop through the mice properties and add them to the category
    category.mice.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      return 1;
    });

    for (const mouse of category.mice) {
      // if the mouse is a string, then it's just a name, otherwise it's an object with a name and a subcategory
      let hasSubCat = false;
      let mouseType = mouse;

      if (typeof mouse === 'object' && mouse.subcategory) {
        hasSubCat = mouse.subcategory;
        mouseType = mouse.mouse;
      }

      // Check if the mouse is in the unsorted list
      const mouseIndex = unsortedMice.findIndex((unsortedMouse) => {
        return unsortedMouse.type === mouseType;
      });

      if (mouseIndex === -1) {
        continue;
      }

      const mouseDiv = await makeMouseDiv(unsortedMice[mouseIndex]);

      if (hasSubCat) {
        if (! addToSubCat[hasSubCat]) {
          addToSubCat[hasSubCat] = [];
        }

        addToSubCat[hasSubCat].push(mouseDiv);
      } else {
        categoryMice.append(mouseDiv);
      }

      categoryWrapper.append(categoryMice);

      // remove the mouse from the unsorted list
      unsortedMice.splice(mouseIndex, 1);

      categoryWrapper.classList.remove('mouse-category-wrapper-hidden');
    }

    // loop through the subcategories and add them to the category
    for (const subcategory of subcategories) {
      // if there are items in addToSubCat for this subcategory, then add them
      if (addToSubCat[subcategory.id] && addToSubCat[subcategory.id].length > 0) {
        // make a subcategory wrapper
        const subcategoryWrapper = document.createElement('div');
        subcategoryWrapper.classList.add('mouse-subcategory-wrapper', `mouse-subcategory-${subcategory.id}`);

        if (subcategory.color) {
          subcategoryWrapper.style.backgroundColor = subcategory.color;
        }

        // find the subcategory name
        const currentSubCat = mouseGroups[currentMapData.map_type].subcategories.find((subcat) => {
          return subcat.id === subcategory.id;
        });

        // Subcategory header.
        const subcategoryHeader = makeElement('div', 'mouse-subcategory-header');
        makeElement('div', 'mouse-subcategory-title', currentSubCat.name, subcategoryHeader);
        subcategoryWrapper.append(subcategoryHeader);

        // Mice in subcategory.
        const subcategoryMice = makeElement('div', 'mouse-subcategory-mice');
        addToSubCat[subcategory.id].forEach((mouseDiv) => {
          subcategoryMice.append(mouseDiv);
        });

        subcategoryWrapper.append(subcategoryMice);
        categoryWrapper.append(subcategoryWrapper);
      }
    }

    categoriesWrapper.append(categoryWrapper);
  }

  // make a category for the unsorted mice
  if (unsortedMice.length > 0) {
    // Wrapper
    const unsortedWrapper = makeElement('div', 'mouse-category-wrapper');
    unsortedWrapper.classList.add('mouse-category-unsorted');

    // Header
    const unsortedHeader = makeElement('div', 'mouse-category-header');

    // Title
    const unsortedTitle = makeElement('div', 'mouse-category-title', 'Unsorted');
    unsortedHeader.append(unsortedTitle);

    // Header close
    unsortedWrapper.append(unsortedHeader);

    // Mice
    const unsortedMiceDiv = makeElement('div', 'mouse-category-mice');
    for (const mouse of unsortedMice) {
      const mouseDiv = await makeMouseDiv(mouse);
      unsortedMiceDiv.append(mouseDiv);
    }

    // Mice close
    unsortedWrapper.append(unsortedMiceDiv);

    // Wrapper close
    categoriesWrapper.append(unsortedWrapper);
  }

  target.append(categoriesWrapper);
};

const makeScavengerSortedPage = async (target) => {
  target.classList.add('scavenger-sorted-page');
  target.classList.add('treasureMapView-block');

  target.setAttribute('data-scavenger-sorted-by', 'none');
  target.setAttribute('data-scavenger-sort-direction', 'descending');

  const sortMice = (direction = 'descending') => {
    const container = target.querySelector('.sorted-page-content');
    if (! container) {
      return;
    }

    const mice = target.querySelectorAll('.mouse-container');
    if (! mice) {
      return;
    }

    // sort the mice by the value in the data-ar attribute on the mh-ui-ar element
    const miceArray = [...mice];
    miceArray.sort((a, b) => {
      let aAr = 0;
      let bAr = 0;

      const aArEl = a.querySelector('.mh-ui-ar');
      if (aArEl) {
        aAr = aArEl.getAttribute('data-ar') || 0;
      }

      const bArEl = b.querySelector('.mh-ui-ar');
      if (bArEl) {
        bAr = bArEl.getAttribute('data-ar') || 0;
      }

      if (direction === 'ascending') {
        return aAr - bAr;
      }

      return bAr - aAr;
    });

    mice.forEach((mouse) => {
      mouse.remove();
    });

    const locationHeaders = container.querySelectorAll('.scavenger-location-wrapper');
    if (locationHeaders) {
      locationHeaders.forEach((header) => {
        header.remove();
      });
    }

    miceArray.forEach((mouse) => {
      container.append(mouse);
    });
  };

  const environments = await getData('environments');
  if (! environments) {
    return;
  }

  const sortMiceIntoLocations = async (direction = 'descending') => {
    const container = target.querySelector('.sorted-page-content');
    if (! container) {
      return;
    }

    const mice = target.querySelectorAll('.mouse-container');
    if (! mice) {
      return;
    }

    // for each mouse, call getLocationForMouse and then seperate them into their respective locations
    const miceByLocation = {};
    const locations = {};

    for (const mouse of mice) {
      const mouseId = mouse.getAttribute('data-mouse-id');
      const location = await getLocationForMouse(mouseId, 'item');
      locations[location.id] = location;

      const locationId = location.id;

      if (! miceByLocation[locationId]) {
        miceByLocation[locationId] = [];
      }

      miceByLocation[locationId].push(mouse);
    }

    // move all the mice to the container
    mice.forEach((mouse) => {
      mouse.remove();
    });

    // remove all the location headers
    const locationHeaders = document.querySelectorAll('.scavenger-location-wrapper');
    if (locationHeaders) {
      locationHeaders.forEach((header) => {
        header.remove();
      });
    }

    // Sort the locations by the number of mice in them
    const sortedLocations = Object.keys(miceByLocation).sort((a, b) => {
      return miceByLocation[b].length - miceByLocation[a].length;
    });

    // Make a header for each location and then append the mice to it
    sortedLocations.forEach((location) => {
      const locationWrapper = makeElement('div', ['treasureMapView-goals-groups', 'scavenger-location-wrapper']);
      const header = makeElement('div', ['treasureMapView-block-content-heading', 'scavenger-location-header']);
      const locationContent = makeElement('div', 'scavenger-location-content');

      // get the environment name and icon
      const environment = environments.find((env) => env.id === location);

      // Handle the whole twisted garden thing.
      if (locations[environment.id]) {
        environment.name = locations[environment.id].name;
      }

      if (environment) {
        if (environment.image) {
          const headerImage = makeElement('div', ['treasureMapView-block-content-heading-image', 'scavenger-location-icon']);
          headerImage.style.backgroundImage = `url(${environment.image})`;
          header.append(headerImage);
        }

        if (environment.name) {
          const envLink = makeElement('a', 'scavenger-location-name', environment.name);
          envLink.title = `Travel to ${environment.name}`;
          envLink.setAttribute('data-environment-id', location);
          envLink.addEventListener('click', () => {
            showTravelConfirmation(environment, mapModel());
          });

          header.append(envLink);
          makeElement('span', 'scavenger-location-count', ` (${miceByLocation[location].length})`, header);
        }
      }

      locationWrapper.append(header);

      miceByLocation[location].forEach((mouse) => {
        // Depending on the direction, we want to reverse the order of the mice
        if (direction === 'ascending') {
          locationContent.prepend(mouse);
        } else {
          locationContent.append(mouse);
        }
      });

      locationWrapper.append(locationContent);
      container.append(locationWrapper);
    });
  };

  const toggleSortDirection = async () => {
    const currentDirection = target.getAttribute('data-scavenger-sort-direction');
    const currentSort = target.getAttribute('data-scavenger-sorted-by');

    const newDirection = currentDirection === 'descending' ? 'ascending' : 'descending';
    target.setAttribute('data-scavenger-sort-direction', newDirection);

    await sortMice(newDirection);
    if (currentSort === 'location') {
      await sortMiceIntoLocations(newDirection);
    }
  };

  const toggleSortType = async () => {
    const currentSort = target.getAttribute('data-scavenger-sorted-by');
    const currentDirection = target.getAttribute('data-scavenger-sort-direction');

    if (currentSort === 'location') {
      target.setAttribute('data-scavenger-sorted-by', 'none');
      sortMice(currentDirection);
    } else {
      target.setAttribute('data-scavenger-sorted-by', 'location');
      await sortMiceIntoLocations(currentDirection);
    }
  };

  // make buttons to toggle between drop rate sorting or by location
  const toggleWrapper = makeElement('div', 'scavenger-toggle-wrapper');

  const toggleByLocation = makeElement('button', ['scavenger-toggle-button', 'mousehuntActionButton', 'tiny']);
  makeElement('span', 'scavenger-toggle-text', 'Sort by Location', toggleByLocation);
  toggleByLocation.addEventListener('click', async () => {
    toggleByLocation.classList.add('disabled');
    await toggleSortType();
    toggleByLocation.classList.remove('disabled');
  });

  toggleWrapper.append(toggleByLocation);

  const toggleByDropRate = makeElement('button', ['scavenger-toggle-button', 'mousehuntActionButton', 'tiny']);
  makeElement('span', 'scavenger-toggle-text', 'Sort by Drop Rate', toggleByDropRate);
  toggleByDropRate.addEventListener('click', async () => {
    toggleByDropRate.classList.add('disabled');
    await toggleSortDirection();
    toggleByDropRate.classList.remove('disabled');
  });

  toggleWrapper.append(toggleByDropRate);

  const sortedContainer = document.querySelector('#sorted-mice-container');
  if (sortedContainer) {
    sortedContainer.prepend(toggleWrapper);
  } else {
    target.prepend(toggleWrapper);
  }

  target.setAttribute('data-scavenger-sorted-by', 'location');
  target.setAttribute('data-scavenger-sort-direction', 'descending');
  await sortMiceIntoLocations('descending');
};

const makeGenericSortedPage = async () => {
  const target = document.querySelector('.sorted-page-content');
  if (! target) {
    return;
  }

  const currentMapData = getMapData(mapData().map_id);

  let type = 'mouse';
  if (currentMapData.map_type.includes('scavenger')) {
    type = 'item';
    target.classList.add('treasureMapView-block-content');
    target.classList.add('scavenger-sorted-page');
  } else {
    target.classList.add('generic-sorted-page');
  }

  const { unsortedMice } = getMouseDataForMap(currentMapData, type);

  // Sort from highest to lowest AR via the async getHighestArForMouse function.
  const sortedUnsorted = await Promise.all(
    unsortedMice.map(async (mouse) => {
      const ar = await getHighestArForMouse(mouse.unique_id, type);
      return {
        ...mouse,
        ar,
      };
    })
  );

  sortedUnsorted.sort((a, b) => {
    if (a.ar > b.ar) {
      return -1;
    }
    return 1;
  });

  // call makeMouseDiv for each mouse but in the sorted order and not asynchonously
  for (const mouse of sortedUnsorted) {
    const mouseDiv = await makeMouseDiv(mouse, type);
    target.append(mouseDiv);
  }
};

const moveTabToBody = () => {
  const sortedMiceContainer = document.querySelector('#sorted-mice-container');
  if (! sortedMiceContainer) {
    return;
  }

  const body = document.querySelector('body');
  if (! body) {
    return;
  }

  body.append(sortedMiceContainer);
};

const processSortedTabClick = async () => {
  const currentlyActive = document.querySelector('.treasureMapRootView-subTab.sorted-map-tab.active');
  if (currentlyActive) {
    return;
  }

  const otherTabs = document.querySelectorAll('.treasureMapRootView-subTab:not(.sorted-map-tab)');
  if (otherTabs) {
    otherTabs.forEach((tab) => {
      // remove the event listener, then add it back.
      tab.removeEventListener('click', moveTabToBody);
      tab.addEventListener('click', moveTabToBody);
    });
  }

  // Get the current map data.
  const currentMapData = mapData();

  if (! currentMapData || ! currentMapData.goals) {
    return;
  }

  // First, remove the active class from the other tab, and add it to this one.
  const activeTab = document.querySelector('.treasureMapRootView-subTab.active');
  if (activeTab) {
    activeTab.classList.remove('active');
  }

  const sortedTab = document.querySelector('.treasureMapRootView-subTab.sorted-map-tab');
  if (sortedTab) {
    sortedTab.classList.add('active');
  }

  const mapContainer = document.querySelector('.treasureMapView-blockWrapper');
  if (! mapContainer) {
    return;
  }

  // Now, hide the regular mice list, and show the sorted one.
  const leftBlock = mapContainer.querySelector('.treasureMapView-leftBlock');
  if (leftBlock) {
    leftBlock.style.display = 'none';
  }

  const rightBlock = mapContainer.querySelector('.treasureMapView-rightBlock');
  if (rightBlock) {
    rightBlock.style.display = 'none';
  }

  const existing = document.querySelector('#sorted-mice-container');
  if (existing) {
    existing.remove();
  }

  const sortedMiceContainer = document.createElement('div');
  sortedMiceContainer.id = 'sorted-mice-container';

  // First, make the sorted page with the loading icon, and then add the mice to it.
  const sortedPage = makeSortedPageWrapper();
  sortedMiceContainer.append(sortedPage);
  mapContainer.append(sortedMiceContainer);

  if (mouseGroups[currentMapData.map_type]) {
    await makeSortedMiceList();
  } else if (currentMapData.is_scavenger_hunt) {
    await makeGenericSortedPage();
    await makeScavengerSortedPage(sortedPage);
  } else {
    await makeGenericSortedPage();
  }

  // Remove the loading icon.
  const loading = document.querySelector('.sorted-loading');
  if (loading) {
    loading.remove();
  }

  doHighlighting();
};

const addSortedMapTab = () => {
  const mapTabs = document.querySelector('.treasureMapRootView-subTabContainer');
  if (! mapTabs || mapTabs.length <= 0) {
    return false;
  }

  if (mapTabs.querySelector('.sorted-map-tab')) {
    return false;
  }

  const sortedTab = makeElement('a', 'treasureMapRootView-subTab sorted-map-tab', 'Sorted');
  sortedTab.setAttribute('data-type', 'sorted');

  sortedTab.addEventListener('click', processSortedTabClick);

  const divider = makeElement('div', 'treasureMapRootView-subTab-spacer');

  // Add as the first tab.
  mapTabs.insertBefore(divider, mapTabs.children[0]);
  mapTabs.insertBefore(sortedTab, mapTabs.children[0]);

  return true;
};

const showSortedTab = () => {
  processSortedTabClick();
  addArToggle('sorted');
};

const hideSortedTab = () => {
  removeArToggle();
};

export {
  addSortedMapTab,
  hideSortedTab,
  showSortedTab
};
