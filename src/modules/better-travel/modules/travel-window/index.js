import {
  addStyles,
  addSubmenuItem,
  createPopup,
  debug,
  getCurrentLocation,
  getData,
  getSetting,
  isUserTitleAtLeast,
  onDialogHide,
  onEvent,
  travelTo
} from '@utils';

import { getTravelSetting, saveTravelSetting } from '../../utils';

import styles from './styles.css';

/**
 * Get the hidden locations.
 *
 * @return {string[]} The hidden locations.
 */
const getHiddenLocations = () => {
  return getTravelSetting('travel-window-hidden-locations', []);
};

/**
 * Toggle hiding a location.
 *
 * @param {string} location The location to toggle.
 */
const toggleLocation = (location) => {
  if (isLocationHidden(location)) {
    unhideLocation(location);
  } else {
    hideLocation(location);
  }
};

/**
 * Hide a location.
 *
 * @param {string} location The location to hide.
 */
const hideLocation = (location) => {
  const hiddenLocations = getHiddenLocations();
  if (hiddenLocations.includes(location)) {
    return;
  }

  hiddenLocations.push(location);
  saveTravelSetting('travel-window-hidden-locations', hiddenLocations);
};

/**
 * Unhide a location.
 *
 * @param {string} location The location to unhide.
 */
const unhideLocation = (location) => {
  const hiddenLocations = getHiddenLocations();
  if (! hiddenLocations.includes(location)) {
    return;
  }

  hiddenLocations.splice(hiddenLocations.indexOf(location), 1);
  saveTravelSetting('travel-window-hidden-locations', hiddenLocations);
};

/**
 * Check if a location is hidden.
 *
 * @param {string} location The location to check.
 *
 * @return {boolean} True if the location is hidden.
 */
const isLocationHidden = (location) => {
  const hiddenLocations = getHiddenLocations();
  return hiddenLocations.includes(location);
};

/**
 * Open the travel window.
 */
const openTravelWindow = async () => {
  debug('Opening travel window');
  const regions = [
    { type: 'gnawnia', name: 'Gnawnia' },
    { type: 'valour', name: 'Valour' },
    { type: 'whisker_woods', name: 'Whisker Woods' },
    { type: 'burroughs', name: 'Burroughs' },
    { type: 'furoma', name: 'Furoma' },
    { type: 'bristle_woods', name: 'Bristle Woods' },
    { type: 'tribal_isles', name: 'Tribal Isles' },
    { type: 'varmint_valley', name: 'Varmint Valley' },
    { type: 'desert', name: 'Sandtail Desert' },
    { type: 'rodentia', name: 'Rodentia' },
    { type: 'queso_canyon', name: 'Queso Canyon' },
    { type: 'zokor_zone', name: 'Hollow Heights' },
    { type: 'folklore_forest', name: 'Folklore Forest' },
    { type: 'riftopia', name: 'Rift Plane' },
  ];

  environments = await getData('environments');
  const eventEnvironments = await getData('environments-events');
  environments = [...environments, ...eventEnvironments];
  const environmentById = new Map(environments.map((environment) => [environment.id, environment]));

  const currentEnvironment = environments.find((e) => e.id === getCurrentLocation());
  const locationsToRemove = ['acolyte_realm'];

  environments = environments.map((env) => {
    if (! isUserTitleAtLeast(env.title)) {
      locationsToRemove.push(env.id);
    }

    return env;
  });

  environments = environments.filter((env) => ! locationsToRemove.includes(env.id));

  // Wrapper start.
  let content = '<div class="mh-improved-travel-window greatWinterHuntGolemDestinationView"><div class="greatWinterHuntGolemDestinationView__content">';

  content += `<div class="mh-improved-travel-window-search-input-wrapper">
    <label for="mh-improved-travel-window-search-input" class="mh-improved-travel-window-search-label">Search:</label>
      <input type="text" id="mh-improved-travel-window-search-input" class="mh-improved-travel-window-search-input" placeholder="Search locations">
    </label>
    <div class="mh-improved-travel-window-sort">
      <button class="mousehuntActionButton mh-improved-travel-window-sort-name small" data-sorted-by-name="false">
        <span>Sort by Name</span>
      </button>
    </div>
  </div>`;

  const hasTitles = false;

  // Locations.
  content += '<div class="greatWinterHuntGolemDestinationView__environmentsContainer"><div class="greatWinterHuntGolemDestinationView__environmentsScroller"><div class="greatWinterHuntGolemDestinationView__regionList">';

  if (! hasTitles) {
    content += `<div class="greatWinterHuntGolemDestinationView__regionGroup" data-region-type="all">
      <div class="greatWinterHuntGolemDestinationView__regionEnvironments">`;
  }

  for (const region of regions) {
    if (hasTitles) {
      content += `<div class="greatWinterHuntGolemDestinationView__regionGroup" data-region-type="${region.type}">
        <div class="greatWinterHuntGolemDestinationView__regionName">${region.name}</div>
        <div class="greatWinterHuntGolemDestinationView__regionEnvironments">`;
    }

    const regionEnvironments = environments.filter((e) => e.region === region.type);
    regionEnvironments.forEach((environment) => {
      let envButtonClass = 'greatWinterHuntGolemDestinationView__environment';
      if (currentEnvironment && currentEnvironment.id && currentEnvironment.id === environment.id) {
        envButtonClass += ' greatWinterHuntGolemDestinationView__environment--active';
      }

      if (isLocationHidden(environment.id)) {
        envButtonClass += ' mh-improved-travel-window-hidden';
      }

      if (environment.type === getCurrentLocation()) {
        envButtonClass += ' greatWinterHuntGolemDestinationView__environment--current';
      }

      content += `<a class="${envButtonClass}" data-environment-type="${environment.id}" order="${environment.order}">
        <div class="greatWinterHuntGolemDestinationView__environmentName">
            <span>${environment.name}</span>
        </div>
        <div class="greatWinterHuntGolemDestinationView__environmentImage" style="background-image:url(${environment.headerImage});" data-environment-type="${environment.id}"></div>
      </a>`;
    });

    if (hasTitles) {
      content += '</div></div>';
    }
  }

  if (! hasTitles) {
    content += '</div></div>';
  }

  content += '</div></div></div>';

  // wrapper end.
  content += '</div>';

  content += `<div class="mh-improved-travel-window-footer">
    <div class="mh-improved-travel-window-edit mousehuntActionButton">
      <span>Edit</span>
    </div>
    <div class="mh-improved-travel-window-description">
      Click on a location to toggle the visibility.
    </div>
  </div>`;

  content += '</div>';

  const popup = createPopup({
    id: 'mh-improved-travel-window',
    title: '',
    content,
    className: 'mh-improved-travel-window-popup jsDialogFixed',
    show: false,
  });

  popup.setOffsetHeight(0);
  popup.setPersistentOffsetHeight(0);
  popup.setIsModal(false);
  popup.show();

  const travelWindow = document.querySelector('.mh-improved-travel-window');
  if (! travelWindow) {
    return;
  }

  const editButton = document.querySelector('.mh-improved-travel-window-edit');
  if (! editButton) {
    return;
  }

  const editButtonSpan = editButton.querySelector('span');
  if (! editButtonSpan) {
    return;
  }

  const environmentButtons = document.querySelectorAll('.greatWinterHuntGolemDestinationView__environment');
  if (! environmentButtons) {
    return;
  }

  const sortNameButton = document.querySelector('.mh-improved-travel-window-sort-name');
  const sortNameButtonText = document.querySelector('.mh-improved-travel-window-sort-name span');
  if (sortNameButton && sortNameButtonText) {
    sortNameButton.addEventListener('click', () => {
      const isSortedByName = sortNameButton.getAttribute('data-sorted-by-name') === 'true';
      if (isSortedByName) {
        debug('Already sorted by name, toggling back to default order');
        sortNameButton.setAttribute('data-sorted-by-name', 'false');
        sortNameButtonText.textContent = 'Sort by Name';

        // Sort by original order
        const sortedButtons = [...environmentButtons].sort((a, b) => {
          const envA = environmentById.get(a.getAttribute('data-environment-type'));
          const envB = environmentById.get(b.getAttribute('data-environment-type'));
          return (envA?.order || 0) - (envB?.order || 0);
        });

        const container = environmentButtons[0].parentElement;
        sortedButtons.forEach((button) => container.append(button));
      } else {
        debug('Sorting environments by name');
        sortNameButton.setAttribute('data-sorted-by-name', 'true');
        sortNameButtonText.textContent = 'Sort by Default Order';

        // Sort alphabetically by name
        const sortedButtons = [...environmentButtons].sort((a, b) => {
          const envA = environmentById.get(a.getAttribute('data-environment-type'));
          const envB = environmentById.get(b.getAttribute('data-environment-type'));
          return (envA?.name || '').localeCompare(envB?.name || '');
        });

        const container = environmentButtons[0].parentElement;
        sortedButtons.forEach((button) => container.append(button));
      }
    });
  }

  editButton.addEventListener('click', () => {
    isEditing = ! isEditing;
    if (isEditing) {
      travelWindow.classList.add('mh-improved-travel-window--editing');
      editButtonSpan.textContent = 'Save';
      editButton.classList.add('active');
    } else {
      travelWindow.classList.remove('mh-improved-travel-window--editing');
      editButtonSpan.textContent = 'Edit';
      editButton.classList.remove('active');
    }
  });

  environmentButtons.forEach((button) => {
    const environmentType = button.getAttribute('data-environment-type');

    button.addEventListener('click', async () => {
      if (isEditing) {
        toggleLocation(environmentType);
        button.classList.toggle('mh-improved-travel-window-hidden');
      } else {
        debug(`Traveling to ${environmentType}`);
        await travelTo(environmentType);
        popup.hide();
      }
    });
  });

  onDialogHide(() => {
    isEditing = false;
  });

  const search = document.querySelector('.mh-improved-travel-window-search-input');
  if (! search) {
    return;
  }

  search.focus();

  search.addEventListener('input', () => {
    const value = search.value.trim().toLowerCase();

    environmentButtons.forEach((button) => {
      const environmentType = button.getAttribute('data-environment-type');
      const environment = environmentById.get(environmentType);

      button.style.display = environment.name.toLowerCase().includes(value) ? 'block' : 'none';
    });
  });

  // if they hit enter, travel to the first visible location.
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const visibleButton = document.querySelector('.greatWinterHuntGolemDestinationView__environment[style="display: block;"]');
      if (visibleButton && ! visibleButton.classList.contains('greatWinterHuntGolemDestinationView__environment--active')) {
        visibleButton.click();
      }
    }
  });
};

let isEditing = false;
let environments = [];

/**
 * Add the travel window to the menu.
 */
const makeMenuItem = () => {
  addSubmenuItem({
    id: 'mh-improved-travel-window',
    menu: 'travel',
    label: 'Travel Window',
    icon: 'https://i.mouse.rip/icons/tiles.png',
    callback: () => openTravelWindow(),
  });
};

/**
 * Add a listener to the environment icon to open the travel window.
 */
const addEnvironmentIconListener = () => {
  const environmentIcon = document.querySelector('.mousehuntHud-environmentIcon');
  if (! environmentIcon) {
    return;
  }

  environmentIcon.classList.add('mh-improved-travel-window-environment-icon');
  environmentIcon.title = 'Open Travel Window';

  environmentIcon.addEventListener('click', () => {
    openTravelWindow();
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-travel-travel-window');
  makeMenuItem();

  if (getSetting('better-travel.travel-window-environment-icon', true)) {
    addEnvironmentIconListener();
  }

  onEvent('mh-improved-open-travel-window', openTravelWindow);

  environments = await getData('environments');
};
