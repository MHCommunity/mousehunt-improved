import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  let options = [
    { name: 'Default', value: 'default' },
    { name: 'Events', value: 'group', options: [
      { name: 'Birthday (Year 10)', value: 'birthday.year10' },
      { name: 'Birthday (Year 11)', value: 'birthday.year11' },
      { name: 'Birthday (Year 12)', value: 'birthday.year12' },
      { name: 'Birthday (Year 13)', value: 'birthday.year13' },
      { name: 'Birthday (Year 14)', value: 'birthday.year14' },
      { name: 'Birthday (Year 15)', value: 'birthday.year15' },
      { name: 'Birthday', value: 'birthday' },
      { name: 'Great Winter Hunt', value: 'winter_hunt' },
      { name: 'Halloween', value: 'halloween' },
      { name: 'Larry\'s Football Challenge', value: 'larrys_football_challenge' },
      { name: 'Pride (LGS Required)', value: 'pride' },
      { name: 'Remembrance Day', value: 'remembrance_day' },
      { name: 'Spring Egg Hunt (LGS Required)', value: 'spring-egg-hunt' },
      { name: 'Spring Egg Hunt Alt (LGS Required)', value: 'spring-egg-hunt-alt' },
      { name: 'Valentine\'s', value: 'valentines' },
    ] },
    { name: 'Color (LGS required)', value: 'group', options: [
      { name: 'Blue', value: 'color-blue' },
      { name: 'Blue with matching timer', value: 'color-blue-timer' },
      { name: 'Cyan', value: 'color-cyan' },
      { name: 'Cyan with matching timer', value: 'color-cyan-timer' },
      { name: 'Cyan with matching background', value: 'color-cyan-background' },
      { name: 'Cyan with matching timer and background', value: 'color-cyan-timer-background' },
      { name: 'Green', value: 'color-green' },
      { name: 'Green with matching timer', value: 'color-green-timer' },
      { name: 'Green with matching background', value: 'color-green-background' },
      { name: 'Green with matching timer and background', value: 'color-green-timer-background' },
      { name: 'Pink', value: 'color-pink' },
      { name: 'Pink with matching background', value: 'color-pink-background' },
      { name: 'Pink with matching timer and background', value: 'color-pink-timer-background' },
      { name: 'Purple', value: 'color-purple' },
      { name: 'Purple with matching background', value: 'color-purple-background' },
      { name: 'Purple with matching timer and background', value: 'color-purple-timer-background' },
      { name: 'Red', value: 'color-red' },
      { name: 'Red with matching background', value: 'color-red-background' },
      { name: 'Red with matching timer and background', value: 'color-red-timer-background' },
      { name: 'Faded', value: 'color-faded' },
      { name: 'Faded with matching background', value: 'color-faded-background' },
      { name: 'Rainbow', value: 'color-rainbow' },
      { name: 'Rainbow with matching timer', value: 'color-rainbow2-timer' },
      { name: 'Cotton Candy', value: 'color-cotton-candy' },
    ] },
    { name: 'Title Shields', value: 'group', options: [
      { name: 'Current Title ', value: 'title' },
      { name: 'Novice', value: 'title.novice' },
      { name: 'Recruit', value: 'title.recruit' },
      { name: 'Apprentice', value: 'title.apprentice' },
      { name: 'Initiate', value: 'title.initiate' },
      { name: 'Journeyman / Journeywoman', value: 'title.journeyman' },
      { name: 'Master', value: 'title.master' },
      { name: 'Grandmaster', value: 'title.grandmaster' },
      { name: 'Legendary', value: 'title.legendary' },
      { name: 'Hero', value: 'title.hero' },
      { name: 'Knight', value: 'title.knight' },
      { name: 'Lord / Lady', value: 'title.lord' },
      { name: 'Baron / Baroness', value: 'title.baron' },
      { name: 'Count / Countess', value: 'title.count' },
      { name: 'Duke / Duchess', value: 'title.duke' },
      { name: 'Grand Duke / Duchess', value: 'title.grandduke' },
      { name: 'Archduke / Archduchess', value: 'title.archduke' },
      { name: 'Viceroy', value: 'title.viceroy' },
      { name: 'Elder', value: 'title.elder' },
      { name: 'Sage', value: 'title.sage' },
      { name: 'Fabled', value: 'title.fabled' },
    ] },
    { name: 'Silly', value: 'group', options: [
      { name: 'Scrambles ', value: 'scrambles' },
      { name: 'Jerry ', value: 'jerry' },
      { name: 'Romeno ', value: 'romeno' }
    ] }
  ];

  if (! user.has_shield) {
    // If the user doesn't have LGS, they can't do the pride or SEH shields.
    const toDisable = new Set([
      'pride',
      'spring-egg-hunt',
      'spring-egg-hunt-alt',
      'Color (LGS required)',
    ]);

    // Set all the options the user can't select as disabled, including all of the "Color (LGS required)" options.
    options = options.map((option) => {
      // Check if the name, value, or the parent group name is in the toDisable array.
      if ('group' === option.value) {
        // If the option is a group, check if the name or value is in the toDisable array.
        const disabledParent = toDisable.has(option.name) || toDisable.has(option.value);
        if (disabledParent) {
          option.disabled = true;
        }

        option.options = option.options.map((groupOption) => {
          // If the option is in the toDisable array, disable it.
          if (toDisable.has(groupOption.value) || disabledParent) {
            groupOption.disabled = true;
          }

          return groupOption;
        });
      }
      return option;
    });
  }

  addMhuiSetting(
    'custom-shield',
    'Custom Shield',
    [options[0]],
    'Replace the default shield with a custom one.',
    module,
    {
      type: 'multi-select',
      number: 1,
      options,
    }
  );
}
