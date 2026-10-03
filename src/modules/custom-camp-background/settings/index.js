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
    css: gradient.css,
  }));

  const options = [
    { name: 'Default', value: 'default' },
    { name: 'Blueprint', value: 'background-blueprint', css: 'url(https://i.mouse.rip/mh-improved/custom-hud/hud-blueprint.png)' },
    { name: 'Marble', value: 'background-marble', css: 'url(https://www.mousehuntgame.com/images/ui/backgrounds/hud_bg_blue_repeating.png)' },
    { name: 'Wood', value: 'background-wood', css: 'url(https://i.mouse.rip/bg-wood.png)' },
    {
      name: 'Color',
      value: 'group',
      options: [
        { name: 'Black', value: 'background-black', css: '#262b33' },
        { name: 'Blue', value: 'background-blue', css: '#bad4ed' },
        { name: 'Cyan', value: 'background-cyan', css: '#abdbd3' },
        { name: 'Green', value: 'background-green', css: '#b4dbb8' },
        { name: 'Pink', value: 'background-pink', css: '#e8c6eb' },
        { name: 'Purple', value: 'background-purple', css: '#d8caf3' },
        { name: 'Red', value: 'background-red', css: '#f2c7c5' },
        { name: 'White', value: 'background-white', css: '#fff' },
        { name: 'Faded', value: 'background-faded', css: '#fff4c5' },
      ],
    },
    {
      name: 'Other',
      value: 'group',
      options: gradientOptions,
    },
  ];

  return [
    {
      id: 'custom-camp-background',
      live: true,
      title: 'Custom camp background',
      default: [options[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        searchable: true,
        placeholder: 'Search backgrounds…',
        options,
      },
    },
  ];
};
