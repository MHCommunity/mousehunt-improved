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
  setPage,
  travelTo
} from '@utils';

import { getTravelSetting, saveTravelSetting } from './travel-utils';

import styles from './travel-menu.css';

const getHiddenLocations = () => {
  return getTravelSetting('travel-window-hidden-locations', []);
};

const toggleLocation = (location) => {
  if (isLocationHidden(location)) {
    unhideLocation(location);
  } else {
    hideLocation(location);
  }
};

const hideLocation = (location) => {
  const hiddenLocations = getHiddenLocations();
  if (hiddenLocations.includes(location)) {
    return;
  }

  hiddenLocations.push(location);
  saveTravelSetting('travel-window-hidden-locations', hiddenLocations);
};

const unhideLocation = (location) => {
  const hiddenLocations = getHiddenLocations();
  if (! hiddenLocations.includes(location)) {
    return;
  }

  hiddenLocations.splice(hiddenLocations.indexOf(location), 1);
  saveTravelSetting('travel-window-hidden-locations', hiddenLocations);
};

const isLocationHidden = (location) => {
  const hiddenLocations = getHiddenLocations();
  return hiddenLocations.includes(location);
};

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

  const currentEnvironment = environments.find((e) => e.id === getCurrentLocation());

  const locationsToRemove = ['forbidden_grove'];

  environments = environments.map((env) => {
    if (! isUserTitleAtLeast(env.title)) {
      locationsToRemove.push(env.id);
    }

    return env;
  });

  environments = environments.filter((env) => ! locationsToRemove.includes(env.id));

  // Wrapper start.
  let content = '<div class="mh-improved-travel-window greatWinterHuntGolemDestinationView"><div class="greatWinterHuntGolemDestinationView__content">';

  content += '<div class="mh-improved-travel-window-search-input-wrapper"><input type="text" class="mh-improved-travel-window-search-input" placeholder="Search locations"></div>';

  // Region menu.
  content += '<div class="greatWinterHuntGolemDestinationView__regionsContainer">';
  for (const region of regions) {
    let buttonClass = 'greatWinterHuntGolemDestinationView__regionButton';
    if (currentEnvironment?.region === region?.type) {
      buttonClass += ' greatWinterHuntGolemDestinationView__regionButton--active';
    }

    content += `<button class="${buttonClass}" data-region-type="${region.type}">${region.name}</button>`;
  }
  content += '</div>';

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

      content += `<button class="${envButtonClass}" data-environment-type="${environment.id}">
        <div class="greatWinterHuntGolemDestinationView__environmentName">
            <span>${environment.name}</span>
        </div>
        <div class="greatWinterHuntGolemDestinationView__environmentImage" style="background-image:url(${environment.headerImage});" data-environment-type="${environment.id}"></div>
      </button>`;
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
    <div class="mh-improved-travel-window-edit mousehuntActionButton"><span>Edit</span></div>
    <div class="mh-improved-travel-window-description">Click on a location to toggle the visibility.</div>
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

    button.addEventListener('click', () => {
      if (isEditing) {
        toggleLocation(environmentType);
        button.classList.toggle('mh-improved-travel-window-hidden');
      } else {
        debug(`Traveling to ${environmentType}`);
        travelTo(environmentType);
        setPage('Camp');
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
      const environment = environments.find((e) => e.id === environmentType);

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

const makeMenuItem = () => {
  addSubmenuItem({
    id: 'mh-improved-travel-window',
    menu: 'travel',
    label: 'Travel Window',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/special.png',
    callback: () => {
      openTravelWindow();
    },
  });
};

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

export default async () => {
  addStyles(styles, 'better-travel-travel-window');
  makeMenuItem();

  if (getSetting('better-travel.travel-window-environment-icon', true)) {
    addEnvironmentIconListener();
  }

  onEvent('mh-improved-open-travel-window', openTravelWindow);

  environments = await getData('environments');
};
