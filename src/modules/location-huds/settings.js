import { getData } from '@utils/data';

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
    'harbour',
    'training_grounds',
    'zugzwang_library',
  ]);

  const locationsToAdd = [
    {
      name: 'Region: Living Garden',
      id: 'region-living-garden',
    },
    {
      name: 'Region: Queso Canyon',
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

    if (eventEnvironments.find((event) => event.id === environment.id)) {
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
    });
  }

  return optionsToReturn;
};
