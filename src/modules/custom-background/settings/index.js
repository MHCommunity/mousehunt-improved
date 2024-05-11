import gradients from '@data/backgrounds.json';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const gradientOptions = gradients.map((gradient) => ({
    name: gradient.name,
    value: gradient.id,
  }));

  const options = [
    { name: 'Default', value: 'default' },
    {
      name: 'Events',
      value: 'group',
      options: [
        { name: 'Birthday', value: 'birthday' },
        { name: 'Great Winter Hunt', value: 'great_winter_hunt' },
        { name: 'Halloween', value: 'halloween' },
        { name: 'Lunar New Year', value: 'lunar_new_year' },
        { name: 'Spring Egg Hunt', value: 'spring_hunt' },
        { name: 'Valentine\'s', value: 'valentines' },
      ],
    },
    {
      name: 'Color',
      value: 'group',
      options: [
        { name: 'Blue', value: 'background-color-blue' },
        { name: 'Cyan', value: 'background-color-cyan' },
        { name: 'Green', value: 'background-color-green' },
        { name: 'Pink', value: 'background-color-pink' },
        { name: 'Purple', value: 'background-color-purple' },
        { name: 'Red', value: 'background-color-red' },
        { name: 'Faded', value: 'background-color-faded' },
      ],
    },
    {
      name: 'Other',
      value: 'group',
      options: gradientOptions,
    },
  ];

  return [{
    id: 'custom-background',
    title: 'Custom Background <a class="mh-improved-custom-bg-preview hidden">Preview choices</a>',
    default: [options[0]],
    description: 'Change the background to an event background, a color, or a gradient.',
    settings: {
      type: 'multi-select',
      number: 1,
      options,
    },
  }];
};
