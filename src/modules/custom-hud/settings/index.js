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
      name: 'Color',
      value: 'group',
      options: [
        { name: 'Cyan', value: 'hud-cyan' },
        { name: 'Green', value: 'hud-green' },
        { name: 'Pink', value: 'hud-pink' },
        { name: 'Purple', value: 'hud-purple' },
        { name: 'Red', value: 'hud-red' },
        { name: 'Teal', value: 'hud-teal' },
        { name: 'Faded', value: 'hud-faded' },
        { name: 'Gray', value: 'hud-gray' },
      ],
    },
    { name: 'Blueprint', value: 'hud-blueprint' },
    {
      name: 'Other',
      value: 'group',
      options: gradientOptions,
    },
  ];

  return [{
    id: 'custom-hud',
    title: 'Custom HUD background <a class="mh-improved-custom-hud-preview hidden">Preview choices</a>',
    default: [options[0]],
    description: 'Change the marbled HUD background',
    settings: {
      type: 'multi-select',
      number: 1,
      options,
    },
  }];
};
