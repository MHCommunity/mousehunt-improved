import {
  addIconToMenu,
  getCurrentLocation,
  getData,
  getSetting,
  saveSetting
} from '@utils';

const getCurrentLocationForSettings = async () => {
  const currentLocation = getCurrentLocation();

  const eventEnvironments = await getData('environments-events');

  // check if we are in an event location
  const eventLocation = eventEnvironments.find((event) => event.id === currentLocation);
  if (eventLocation) {
    return 'event-locations';
  }

  return currentLocation;
};

const getIconSettings = async () => {
  let key = await getCurrentLocationForSettings();
  key = `location-huds-enabled.${key}`;

  let value = getSetting(key, true);

  return {
    id: 'mousehunt-improved-location-huds',
    classname: 'mousehunt-improved-location-huds-icon',
    text: value ? 'Disable HUD' : 'Enable HUD',
    position: 'prepend',
    action: (e, icon) => {
      value = getSetting(key, true);
      saveSetting(key, ! value);

      if (value) {
        icon.textContent = 'Enable HUD';
        icon.classList.add('disabled');
        icon.classList.remove('enabled');
      } else {
        icon.textContent = 'Disable HUD';
        icon.classList.remove('disabled');
        icon.classList.add('enabled');
      }

      window.location.reload();
    }
  };
};

const addToggleIcon = async () => {
  addIconToMenu(await getIconSettings());
};

export default addToggleIcon;
