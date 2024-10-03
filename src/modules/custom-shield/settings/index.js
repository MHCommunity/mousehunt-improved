/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  let options = [
    { name: 'Default', value: 'default' },
    { name: 'Default (normal resolution)', value: 'default-normal' },
    { name: 'Default (no LGS)', value: 'default-no-lgs' },
    { name: 'Glazy', value: 'glazy' },
    {
      name: 'Events',
      value: 'group',
      options: [
        { name: 'Birthday (Generic)', value: 'birthday' },
        { name: 'Birthday (Year 10)', value: 'birthday.year10' },
        { name: 'Birthday (Year 11)', value: 'birthday.year11' },
        { name: 'Birthday (Year 12)', value: 'birthday.year12' },
        { name: 'Birthday (Year 13)', value: 'birthday.year13' },
        { name: 'Birthday (Year 14)', value: 'birthday.year14' },
        { name: 'Birthday (Year 15)', value: 'birthday.year15' },
        { name: 'Birthday (Year 16)', value: 'birthday.year16' },
        { name: 'Great Winter Hunt', value: 'winter_hunt' },
        { name: 'Halloween', value: 'halloween' },
        { name: 'Halloween (Pumpkins)', value: 'halloween-text' },
        { name: 'Larry\'s Football Challenge', value: 'larrys_football_challenge' },
        { name: 'Pride (LGS Required)', value: 'pride' },
        { name: 'Remembrance Day', value: 'remembrance_day' },
        { name: 'Spring Egg Hunt (LGS Required)', value: 'spring-egg-hunt' },
        { name: 'Spring Egg Hunt Alt (LGS Required)', value: 'spring-egg-hunt-alt' },
        { name: 'Valentine\'s', value: 'valentines' },
      ],
    },
    {
      name: 'Color (LGS required)',
      value: 'group',
      options: [
        { name: 'Blue', value: 'color-blue' },
        { name: 'Cyan', value: 'color-cyan' },
        { name: 'Green', value: 'color-green' },
        { name: 'Pink', value: 'color-pink' },
        { name: 'Purple', value: 'color-purple' },
        { name: 'Red', value: 'color-red' },
        { name: 'Faded', value: 'color-faded' },
        { name: 'Rainbow', value: 'color-rainbow' },
        { name: 'Cotton Candy', value: 'color-cotton-candy' },
        { seperator: true },
        { name: 'Blue with matching timer', value: 'color-blue-timer' },
        { name: 'Cyan with matching timer', value: 'color-cyan-timer' },
        { name: 'Green with matching timer', value: 'color-green-timer' },
        { name: 'Pink with matching timer', value: 'color-pink-timer' },
        { name: 'Purple with matching timer', value: 'color-purple-timer' },
        { name: 'Red with matching timer', value: 'color-red-timer' },
        { name: 'Rainbow with matching timer', value: 'color-rainbow-timer' },
      ],
    },
    {
      name: 'Title Shields',
      value: 'group',
      options: [
        { name: 'Current Title ', value: 'title' },
        { seperator: true },
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
      ],
    },
    {
      name: 'Silly',
      value: 'group',
      options: [
        { name: 'Scrambles ', value: 'scrambles' },
        { name: 'Jerry ', value: 'jerry' },
        { name: 'Romeno ', value: 'romeno' },
      ],
    },
  ];

  if (! user.has_shield) {
    // If the user doesn't have LGS, they can't do the pride or SEH shields.
    const toDisable = new Set([
      'default-no-lgs',
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

  return [{
    id: 'custom-shield',
    title: 'Custom Shield <a class="mh-improved-custom-shield-preview">Preview choices</a>',
    default: [options[0]],
    description: 'Change the shield to an event shield, color, title shield, or silly shield.',
    settings: {
      type: 'multi-select',
      number: 1,
      options,
    },
  }];
};
