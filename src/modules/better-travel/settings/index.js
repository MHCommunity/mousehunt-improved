import { addMhuiSetting } from '../../utils';

export default function (module) {
  addMhuiSetting(
    'better-travel-default-to-simple-travel',
    'Show Simple Travel tab by default',
    false,
    'Show the Simple Travel tab by default instead of the map when going to the Travel page.',
    module
  );

  addMhuiSetting(
    'better-travel-show-alphabetized-list',
    'Show Alphabetized List',
    false,
    'Show an alphabetized list of locations on the top of the Simple Travel page.',
    module
  );

  addMhuiSetting(
    'better-travel-show-reminders',
    'Show Travel Reminders',
    true,
    'Show reminders about active resources when visiting certain locations.',
    module
  );
}
