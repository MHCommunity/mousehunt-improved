import gradients from '@data/backgrounds.json';

/**
 * Make an option for one of the image HUD backgrounds.
 *
 * @param {string} name  The name.
 * @param {string} value The value.
 *
 * @return {Object} The option.
 */
const imageOption = (name, value) => ({ name, value, css: `url(https://i.mouse.rip/mh-improved/custom-hud/${value}.png) repeat top center` });

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
    {
      name: 'Color',
      value: 'group',
      options: [
        imageOption('Cyan', 'hud-cyan'),
        imageOption('Green', 'hud-green'),
        imageOption('Pink', 'hud-pink'),
        imageOption('Purple', 'hud-purple'),
        imageOption('Red', 'hud-red'),
        imageOption('Teal', 'hud-teal'),
        imageOption('Faded', 'hud-faded'),
        imageOption('Gray', 'hud-gray'),
      ],
    },
    imageOption('Blueprint', 'hud-blueprint'),
    {
      name: 'Other',
      value: 'group',
      options: gradientOptions,
    },
  ];

  return [
    {
      id: 'custom-hud',
      live: true,
      title: 'Custom HUD Background',
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
