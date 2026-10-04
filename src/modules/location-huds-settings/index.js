import settings from './settings';

/**
 * Initialize the module.
 */
export default {
  id: 'location-huds-settings',
  type: 'location-huds',
  alwaysLoad: true,
  settings,
  load: () => {},
};
