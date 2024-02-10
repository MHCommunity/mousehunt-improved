import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const daily = await addMhuiSetting(
    'journal-changer-change-daily',
    'Randomize daily',
    false,
    '',
    module
  );

  const location = await addMhuiSetting(
    'journal-changer-change-location',
    'Change based on location',
    true,
    '',
    module
  );

  return [daily, location];
};
