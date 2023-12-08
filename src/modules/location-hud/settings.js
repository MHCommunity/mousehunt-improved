import { addMhuiSetting } from '@/utils';

import environments from '@data/environments.json';

export default function (module) {
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
    'mountain',
    'laboratory',
    'mousoleum',
    'training_grounds',
    'seasonal_garden',
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
    }
  ];

  const options = [];

  environments.forEach((environment) => {
    if (! locationsToUnset.has(environment.id)) {
      options.push(environment);
    }
  });

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

  options.forEach((location) => {
    addMhuiSetting(
      location.id,
      location.name,
      true,
      location.description,
      module
    );
  });
}
