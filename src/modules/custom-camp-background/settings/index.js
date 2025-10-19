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
    { name: 'Blueprint', value: 'background-blueprint' },
    { name: 'Marble', value: 'background-marble' },
    { name: 'Wood', value: 'background-wood' },
    {
      name: 'Color',
      value: 'group',
      options: [
        { name: 'Black', value: 'background-black' },
        { name: 'Blue', value: 'background-blue' },
        { name: 'Cyan', value: 'background-cyan' },
        { name: 'Green', value: 'background-green' },
        { name: 'Pink', value: 'background-pink' },
        { name: 'Purple', value: 'background-purple' },
        { name: 'Red', value: 'background-red' },
        { name: 'White', value: 'background-white' },
        { name: 'Faded', value: 'background-faded' },
      ],
    },
    {
      name: 'Other',
      value: 'group',
      options: gradientOptions,
    },
  ];

  return [{
    id: 'custom-camp-background',
    title: 'Custom Camp Background <a class="mh-improved-custom-camp-bg-preview hidden">Preview choices</a>',
    default: [options[1]],
    description: 'Set a custom background for the Camp page.',
    settings: {
      type: 'multi-select',
      number: 1,
      options,
    },
  }];
};
