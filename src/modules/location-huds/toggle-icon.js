import {
  addIconToMenu,
  getCurrentLocation,
  getData,
  getSetting,
  saveSetting
} from '@utils';

/**
 * Get the current location.
 *
 * @return {Promise<string>} The current location.
 */
const getCurrentLocationForSettings = async () => {
  const currentLocation = getCurrentLocation();

  const eventEnvironments = await getData('environments-events');

  // check if we are in an event location.
  if (eventEnvironments && eventEnvironments.length && eventEnvironments.some((event) => event.id === currentLocation)) {
    return 'event-locations';
  }

  return currentLocation;
};

/**
 * Get the icon settings.
 *
 * @return {Promise<Object>} The icon settings.
 */
const getIconSettings = async () => {
  let key = await getCurrentLocationForSettings();
  key = `location-huds-enabled.${key}`;

  let value = getSetting(key, true);

  return {
    id: 'mousehunt-improved-location-huds',
    classname: 'mousehunt-improved-location-huds-icon',
    text: value ? 'Disable HUD' : 'Enable HUD',
    position: 'prepend',

    /**
     * The action to perform when the icon is clicked.
     *
     * @param {Event}   e    The event object.
     * @param {Element} icon The icon element.
     */
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

/**
 * Add the toggle icon to the menu.
 */
export default async () => {
  addIconToMenu(await getIconSettings());
};
