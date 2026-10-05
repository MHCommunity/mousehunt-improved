import { getUserTitle, makeElement } from '@utils';

/**
 * Make the markup for a shield preview.
 *
 * @param {Object} shield    The shield.
 * @param {string} shield.id The shield's setting value.
 *
 * @return {string} The markup.
 */
const shieldPreview = (shield) => {
  const shieldClass = shield.id.replaceAll('color-', ' default color-').replaceAll('-alt', ' alt').replaceAll('.', ' ');

  return `<div class="mh-improved-custom-shield-item-preview ${shield.id}"><a class="mousehuntHud-shield golden ${shieldClass}"></a>
</div>`;
};

/**
 * Make the shield preview for the setting's picker.
 *
 * @param {Object} option The option.
 *
 * @return {HTMLElement} The preview.
 */
const pickerPreview = (option) => {
  // Show the variants without a shield of their own as the shield they use.
  let id = option.value.replace('-timer', '');
  if ('default-normal' === id) {
    id = 'default';
  } else if ('color-cotton-candy' === id) {
    id = 'color-pink';
  } else if ('title' === id) {
    id = `title.${getUserTitle().replaceAll(' ', '')}`;
  }

  const preview = makeElement('span', 'mh-improved-custom-shield-picker-preview');
  preview.innerHTML = shieldPreview({ id });

  return preview;
};

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
    { name: 'Simple golden', value: 'plain' },
    { name: 'Starry', value: 'starry' },
    {
      name: 'Events',
      value: 'group',
      options: [
        { name: 'Birthday (generic)', value: 'birthday' },
        { name: 'Birthday (year 10)', value: 'birthday.year10' },
        { name: 'Birthday (year 11)', value: 'birthday.year11' },
        { name: 'Birthday (year 12)', value: 'birthday.year12' },
        { name: 'Birthday (year 13)', value: 'birthday.year13' },
        { name: 'Birthday (year 14)', value: 'birthday.year14' },
        { name: 'Birthday (year 15)', value: 'birthday.year15' },
        { name: 'Birthday (year 16)', value: 'birthday.year16' },
        { name: 'Birthday (year 17)', value: 'birthday.year17' },
        { name: 'Great Winter Hunt', value: 'winter_hunt' },
        { name: 'Halloween', value: 'halloween' },
        { name: 'Halloween (pumpkins)', value: 'halloween-text' },
        { name: "Larry's Football Challenge", value: 'larrys_football_challenge' },
        { name: 'Pride (LGS required)', value: 'pride' },
        { name: 'Remembrance Day', value: 'remembrance_day' },
        { name: 'Spring Egg Hunt (LGS required)', value: 'spring-egg-hunt' },
        { name: 'Spring Egg Hunt alternate (LGS required)', value: 'spring-egg-hunt-alt' },
        { name: "Valentine's", value: 'valentines' },
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
        { name: 'Cotton candy', value: 'color-cotton-candy' },
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
      name: 'Title shields',
      value: 'group',
      options: [
        { name: 'Current title', value: 'title' },
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
      name: 'Mice',
      value: 'group',
      options: [
        { name: 'Glazy', value: 'glazy' },
        { name: 'Romeno', value: 'romeno' },
        { name: 'Leprechaun', value: 'leprechaun' },
        { name: 'Mythweaver', value: 'mythweaver' },
        { name: 'Romeo', value: 'romeo' },
      ],
    },
    {
      name: 'Other',
      value: 'group',
      options: [
        { name: 'Drawing', value: 'drawing' },
        { name: 'Droid', value: 'droid' },
        { name: 'Scrambles', value: 'scrambles' },
        { name: 'Moustachio', value: 'moustachio' },
        { name: 'Jerry', value: 'jerry' },
      ],
    },
  ];

  if (!user.has_shield) {
    // If the user doesn't have LGS, they can't do the pride or SEH shields.
    const toDisable = new Set(['default-no-lgs', 'pride', 'spring-egg-hunt', 'spring-egg-hunt-alt', 'Color (LGS required)']);

    // Set all the options the user can't select as disabled, including all of the "Color (LGS required)" options.
    options = options.map((option) => {
      // Check if the name, value, or the parent group name is in the toDisable array.
      if ('group' === option.value) {
        // If the option is a group, check if the name or value is in the toDisable array.
        const disabledParent = toDisable.has(option.name) || toDisable.has(option.value);
        if (disabledParent) {
          option.disabled = 'disabled';
        }

        option.options = option.options.map((groupOption) => {
          // If the option is in the toDisable array, disable it.
          if (toDisable.has(groupOption.value) || disabledParent) {
            groupOption.disabled = 'disabled';
          }

          return groupOption;
        });
      }
      return option;
    });
  }

  return [
    {
      id: 'custom-shield',
      live: true,
      title: 'Custom Shield',
      default: [options[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        searchable: true,
        placeholder: 'Search shields…',
        preview: pickerPreview,
        options,
      },
    },
  ];
};
