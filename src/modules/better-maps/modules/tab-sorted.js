import {
  addMHCTData,
  getArEl,
  getData,
  getHighestArForMouse,
  getLocationsForMouse,
  getMapData,
  makeElement,
  makeMhButton,
  mapData,
  mapModel,
  showTravelConfirmation,
  showTravelConfirmationNoDetails
} from '@utils';

import { addArToggle, removeArToggle } from './toggle-ar';
import doHighlighting from './highlighting';

let mouseGroups;

/**
 * Get the mouse data for the map.
 *
 * @param {Object} currentMapData The current map data.
 * @param {string} type           The type of data to get.
 *
 * @return {Object} The mouse data.
 */
const getMouseDataForMap = (currentMapData, type = 'mouse') => {
  // Get the unsorted mice.
  let unsortedMice = [];
  if (currentMapData.goals && currentMapData.goals[type]) {
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

/**
 * Generate the markup for a mouse.
 *
 * @param {Object} mouse The mouse data.
 * @param {string} type  The type of mouse.
 *
 * @return {HTMLElement} The mouse element.
 */
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

  const mouseAr = await getArEl(mouse.type ?? mouse.unique_id, type);
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

  // Mouse extra info close.
  mouseExtraInfoWrapper.append(mouseExtraInfo);

  // Link to MHCT at the bottom of the popup, like the mouse and item popups have.
  const mhctLink = makeElement('a', 'mouse-mhct-link', 'View on MHCT →');
  mhctLink.href = `https://api.mouse.rip/mhct-redirect${'item' === type ? '-item' : ''}/${mouse.unique_id}`;
  mhctLink.target = '_blank';
  mhctLink.addEventListener('click', (event) => {
    // Don't toggle the popup closed when clicking the link.
    event.stopPropagation();
  });
  mouseExtraInfoWrapper.append(mhctLink);

  mouseDiv.append(mouseExtraInfoWrapper);

  /**
   * Position the extra info popup near the mouse, keeping it on screen.
   */
  const positionExtraInfo = () => {
    const rect = mouseDiv.getBoundingClientRect();
    let top = rect.top + 50;
    let left = rect.left;

    mouseExtraInfoWrapper.style.top = `${top}px`;
    mouseExtraInfoWrapper.style.left = `${left}px`;

    // Measure where it actually ended up and nudge it back into the viewport.
    const popupRect = mouseExtraInfoWrapper.getBoundingClientRect();
    const margin = 10;

    if (popupRect.right > window.innerWidth - margin) {
      left -= popupRect.right - (window.innerWidth - margin);
    }

    if (popupRect.left < margin) {
      left += margin - popupRect.left;
    }

    if (popupRect.bottom > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - popupRect.height - 5);
    }

    mouseExtraInfoWrapper.style.top = `${top}px`;
    mouseExtraInfoWrapper.style.left = `${left}px`;
  };

  // Click handler.
  mouseDiv.addEventListener('click', async () => {
    const isSelected = mouseDiv.classList.contains('mouse-container-selected');
    if (isSelected) {
      mouseDiv.classList.remove('mouse-container-selected');
      return;
    }

    // Only allow one mouse to be selected at a time.
    const allSelected = document.querySelectorAll('.mouse-container-selected');
    if (allSelected) {
      allSelected.forEach((selected) => {
        selected.classList.remove('mouse-container-selected');
      });
    }

    mouseDiv.classList.add('mouse-container-selected');
    positionExtraInfo();

    // Append MHCT data, then reposition since the popup size changed.
    await addMHCTData(mouse, mouseExtraInfo, type);
    positionExtraInfo();
  });

  return mouseDiv;
};

/**
 * Make the sorted page wrapper.
 *
 * @return {HTMLElement} The sorted page wrapper.
 */
const makeSortedPageWrapper = () => {
  const sortedPage = makeElement('div', 'sorted-page');
  makeElement('div', ['sorted-loading', 'mousehuntPage-loading', 'active'], '', sortedPage);
  makeElement('div', 'sorted-page-content', '', sortedPage);

  return sortedPage;
};

/**
 * Make the sorted mice list HTML.
 */
const makeSortedMiceList = async () => {
  // Get the current map data.
  const currentMapData = await getMapData(mapData().map_id);
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
      categoryWrapper.style.background = category.color;
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
        const subcategoryWrapper = makeElement('div', ['mouse-subcategory-wrapper', `mouse-subcategory-${subcategory.id}`]);

        if (subcategory.color) {
          subcategoryWrapper.style.backgroundColor = subcategory.color;
        }

        // find the subcategory name
        const currentSubCat = mouseGroups[currentMapData.map_type].subcategories.find((subCat) => {
          return subCat.id === subcategory.id;
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

/**
 * Make the scavenger sorted page.
 *
 * @param {boolean}     isNormal Is this a normal map?
 * @param {HTMLElement} target   The target element.
 * @param {Array}       allMice  The mice data for the map.
 */
const makeScavengerSortedPage = async (isNormal, target, allMice = []) => {
  target.classList.add('scavenger-sorted-page');
  target.classList.add('treasureMapView-block');

  target.setAttribute('data-scavenger-sorted-by', 'none');
  target.setAttribute('data-scavenger-sort-direction', 'descending');

  /**
   * Sort the mice by the AR.
   *
   * @param {string} direction The direction to sort in.
   */
  const sortMice = (direction = 'descending') => {
    const container = target.querySelector('.sorted-page-content');
    if (! container) {
      return;
    }

    const mice = target.querySelectorAll('.mouse-container');
    if (! mice) {
      return;
    }

    // Remove any copies made by the location sort so each mouse only shows once.
    const miceArray = [...mice].filter((mouse) => {
      if (mouse.classList.contains('mouse-container-duplicate')) {
        mouse.remove();
        return false;
      }

      return true;
    });
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

  /**
   * Sort the mice into locations.
   *
   * @param {string} direction The direction to sort in.
   */
  const sortMiceIntoLocations = async (direction = 'descending') => {
    const container = target.querySelector('.sorted-page-content');
    if (! container) {
      return;
    }

    const mice = target.querySelectorAll('.mouse-container');
    if (! mice) {
      return;
    }

    const type = isNormal ? 'mouse' : 'item';

    // Remove any copies from a previous location sort so we start from unique mice.
    const uniqueMice = [...mice].filter((mouse) => {
      if (mouse.classList.contains('mouse-container-duplicate')) {
        mouse.remove();
        return false;
      }

      return true;
    });

    // For each mouse, get every location it can be found in and add it to each
    // of them, falling back to an "Other" group when there's no data.
    const miceByLocation = {};
    const locations = {};

    for (const mouse of uniqueMice) {
      const mouseType = mouse.getAttribute('data-mouse-type');
      let mouseLocations = await getLocationsForMouse(mouseType, type);

      if (! mouseLocations.length) {
        mouseLocations = [{ id: 'other', name: 'Other' }];
      }

      for (const [index, location] of mouseLocations.entries()) {
        locations[location.id] = location;

        if (! miceByLocation[location.id]) {
          miceByLocation[location.id] = [];
        }

        if (0 === index) {
          miceByLocation[location.id].push(mouse);
          continue;
        }

        // The mouse is in multiple locations, so make a copy for each extra one.
        const mouseData = allMice.find((m) => m.type === mouseType);
        if (mouseData) {
          const duplicate = await makeMouseDiv(mouseData, type);
          duplicate.classList.add('mouse-container-duplicate');
          miceByLocation[location.id].push(duplicate);
        }
      }
    }

    // move all the mice to the container
    uniqueMice.forEach((mouse) => {
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

      // Get the environment name and icon, falling back to the location data
      // itself (e.g. the "Other" group or an unknown environment).
      const environment = environments.find((env) => env.id === location);
      const locationData = locations[location] || {};

      const name = locationData.name || environment?.name || 'Other';
      const image = locationData.image || environment?.image || '';

      if (image) {
        const headerImage = makeElement('div', ['treasureMapView-block-content-heading-image', 'scavenger-location-icon']);
        headerImage.style.backgroundImage = `url(${image})`;
        header.append(headerImage);
      }

      const envLink = makeElement('span', 'scavenger-location-name', name);
      if (environment) {
        envLink.title = `Travel to ${name}`;
        envLink.setAttribute('data-environment-id', location);
        envLink.addEventListener('click', () => {
          showTravelConfirmation(environment, mapModel());
        });
      }

      header.append(envLink);
      makeElement('span', 'scavenger-location-count', ` (${miceByLocation[location].length})`, header);

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

  /**
   * Toggle the sort direction.
   */
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

  /**
   * Toggle the sort type.
   */
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

  makeMhButton({
    element: 'button',
    text: 'Sort by Location',
    className: 'scavenger-toggle-button',
    callback: async (event) => {
      const button = event.currentTarget;
      button.classList.add('disabled');
      await toggleSortType();
      button.classList.remove('disabled');
    },
    appendTo: toggleWrapper
  });

  makeMhButton({
    element: 'button',
    text: isNormal ? 'Sort by Attraction Rate' : 'Sort by Drop Rate',
    className: 'scavenger-toggle-button',
    callback: async (event) => {
      const button = event.currentTarget;
      button.classList.add('disabled');
      await toggleSortDirection();
      button.classList.remove('disabled');
    },
    appendTo: toggleWrapper
  });

  const sortedContainer = document.querySelector('#sorted-mice-container');
  if (sortedContainer) {
    sortedContainer.prepend(toggleWrapper);
  } else {
    target.prepend(toggleWrapper);
  }

  target.setAttribute('data-scavenger-sorted-by', 'location');
  target.setAttribute('data-scavenger-sort-direction', 'descending');

  await sortMiceIntoLocations('descending');
  await toggleSortType();
};

/**
 * Make the generic sorted page.
 *
 * @param {boolean}     isNormal   Is this a normal map?
 * @param {HTMLElement} sortedPage The sorted page element.
 */
const makeGenericSortedPage = async (isNormal, sortedPage) => {
  const target = document.querySelector('.sorted-page-content');
  if (! target) {
    return;
  }

  const currentMapData = await getMapData(mapData().map_id);

  const type = isNormal ? 'mouse' : 'item';
  target.classList.add('treasureMapView-block-content', 'scavenger-sorted-page');

  const { unsortedMice } = getMouseDataForMap(currentMapData, type);

  // Sort from highest to lowest AR via the async getHighestArForMouse function.
  const sortedUnsorted = await Promise.all(
    unsortedMice.map(async (mouse) => {
      const ar = await getHighestArForMouse(mouse.type ?? mouse.unique_id, type);
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

  // call makeMouseDiv for each mouse but in the sorted order and not asynchronously
  for (const mouse of sortedUnsorted) {
    const mouseDiv = await makeMouseDiv(mouse, type);
    target.append(mouseDiv);
  }

  await makeScavengerSortedPage(isNormal, sortedPage, sortedUnsorted);
};

/**
 * Move the sorted tab to the body.
 */
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

/**
 * Process the sorted tab click.
 */
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

  if (! mouseGroups) {
    mouseGroups = await getData('map-groups');
  }

  if (mouseGroups[currentMapData.map_type]) {
    await makeSortedMiceList();
  } else if (currentMapData.is_scavenger_hunt) {
    await makeGenericSortedPage(false, sortedPage);
  } else {
    await makeGenericSortedPage(true, sortedPage);
  }

  // Remove the loading icon.
  const loading = document.querySelector('.sorted-loading');
  if (loading) {
    loading.remove();
  }

  doHighlighting();
};

/**
 * Add the sorted map tab.
 *
 * @return {boolean} Whether the tab was added.
 */
const addSortedMapTab = async () => {
  if (! mouseGroups) {
    mouseGroups = await getData('map-groups');
  }

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

/**
 * Fire the actions when the sorted tab is clicked.
 */
const showSortedTab = () => {
  processSortedTabClick();
  addArToggle('sorted');
};

/**
 * Fire the actions when the sorted tab is hidden.
 */
const hideSortedTab = () => {
  removeArToggle();
};

export {
  addSortedMapTab,
  hideSortedTab,
  showSortedTab
};
