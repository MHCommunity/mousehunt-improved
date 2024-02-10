import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const defaultSimpleTab = await addMhuiSetting(
    'better-travel-default-to-simple-travel',
    'Show Simple Travel tab by default',
    false,
    '',
    module
  );

  const alphaList = await addMhuiSetting(
    'better-travel-show-alphabetized-list',
    'Show alphabetized List',
    false,
    '',
    module
  );

  const reminders = await addMhuiSetting(
    'better-travel-show-reminders',
    'Show Travel Reminders',
    true,
    '',
    module
  );

  const travelWindow = await addMhuiSetting(
    'better-travel-travel-window',
    'Travel Window',
    true,
    '',
    module
  );

  const envIcon = await addMhuiSetting(
    'better-travel-travel-window-environment-icon',
    'Environment icon opens Travel Window',
    true,
    '',
    module
  );

  return [defaultSimpleTab, alphaList, reminders, travelWindow, envIcon];
};
