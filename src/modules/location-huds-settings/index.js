import settings from './settings';
/**
 * Initialize the module.
 */
export default {
  id: 'location-huds-settings',
  type: 'locations-maps-travel',
  alwaysLoad: true,
  settings,
  load: init,
};
