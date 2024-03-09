import { addIconToMenu, getCurrentLocation, getSetting, saveSetting } from '@utils';

import eventEnvioronments from '@data/environments-events.json';

const getCurrentLocationForSettings = () => {
  const currentLocation = getCurrentLocation();

  // check if we are in an event location
  const eventLocation = eventEnvioronments.find((event) => event.id === currentLocation);
  if (eventLocation) {
    return 'event-locations';
  }

  return currentLocation;
};

const getIconSettings = () => {
  let key = getCurrentLocationForSettings();
  let value = getSetting(key, true);

  return {
    id: 'mousehunt-improved-location-huds',
    classname: 'mousehunt-improved-location-huds-icon',
    text: value ? 'Disable' : 'Enable',
    position: 'prepend',
    action: (e, icon) => {
      key = getCurrentLocationForSettings();
      value = getSetting(key, true);

      saveSetting(key, ! value);

      if (value) {
        icon.textContent = 'Enable';
        icon.classList.add('disabled');
        icon.classList.remove('enabled');
      } else {
        icon.textContent = 'Disable';
        icon.classList.remove('disabled');
        icon.classList.add('enabled');
      }

      window.location.reload();
    }
  };
};

const addToggleIcon = () => {
  if (! getSetting('location-huds-show-toggle-icon', true)) {
    return;
  }

  addIconToMenu(getIconSettings);
};

export default addToggleIcon;
