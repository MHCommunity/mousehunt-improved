import { addMhuiSetting } from '../../utils';

export default function (module) {
  addMhuiSetting(
    'better-ui-copy-id',
    'Copy ID button',
    true,
    'Hover over your profile picture in the HUD for a quick \'Copy ID to clipboard\' button.',
    module
  );

  addMhuiSetting(
    'better-ui-dark-mode',
    'Dark Mode improvements',
    true,
    'Slight improvements to Dark Mode.',
    module
  );

  addMhuiSetting(
    'better-ui-prestige-base',
    'Show correct stats for Prestige Base',
    true,
    'Updates the Prestige Base stats in the trap picker to show the correct stats.',
    module
  );

  addMhuiSetting(
    'better-ui-friends-paste-id',
    'Paste ID anywhere to go to a Hunter Profile',
    true,
    'Paste a Hunter ID anywhere to go to that Hunter\'s profile.',
    module
  );
}
