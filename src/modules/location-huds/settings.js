import { getData } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const locationsToUnset = new Set([
    'desert_oasis',
    'lost_city',
    'sand_dunes',
    'queso_geyser',
    'queso_plains',
    'queso_quarry',
    'queso_river',
    // Don't have HUD changes for these.
    'meadow',
    'training_grounds',
    'zugzwang_library',
  ]);

  const locationsToAdd = [
    {
      name: 'Living Garden Region',
      id: 'region-living-garden',
    },
    {
      name: 'Queso Canyon Region',
      id: 'region-queso',
    },
    {
      name: 'Event Locations',
      id: 'event-locations',
    },
  ];

  const options = [];

  const environments = await getData('environments');
  const eventEnvironments = await getData('environments-events');

  for (const environment of environments) {
    if (locationsToUnset.has(environment.id)) {
      continue;
    }

    if (eventEnvironments.some((event) => event.id === environment.id)) {
      continue;
    }

    options.push(environment);
  }

  options.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });

  // merge the locations to add with the locations to show as options
  locationsToAdd.forEach((location) => {
    options.push(location);
  });

  const optionsToReturn = [];

  for (const location of options) {
    optionsToReturn.push({
      id: `location-huds-enabled.${location.id}`,
      title: location.name,
      default: true,
      description: location.description,
      settings: location.settings || {},
    });
  }

  optionsToReturn.push(
    {
      id: 'location-huds.location-hud-toggle',
      title: 'Enable quick toggle (top menu bar)',
    },
    {
      id: 'location-huds.flip-avatar-images',
      title: 'Flip avatar images in Bountiful Beanstalk and Valour Rift',
    },
    {
      id: 'location-huds.bountiful-beanstalk-quick-harp-toggle',
      title: 'Bountiful Beanstalk: Enable Auto-Harp toggle',
    },
    {
      id: 'location-huds.bountiful-beanstalk-inventory-in-one-row',
      title: 'Bountiful Beanstalk: Inventory in one row',
    },
    {
      id: 'location-huds.fi-draggable-airship',
      title: 'Floating Islands: Draggable Airship',
    },
    {
      id: 'location-huds.school-of-sorcery-clean-chalkboard',
      title: 'School of Sorcery: Clean chalkboard',
    },
    {
      id: 'location-huds.table-of-contents-scrambles',
      title: 'Table of Contents: Show Scrambles quote on blank page',
      default: true,
    }
  );

  return optionsToReturn;
};
