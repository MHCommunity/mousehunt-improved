/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
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
        { name: 'Blueprint', value: 'hud-blueprint' },
      ],
    },
  ];

  return [{
    id: 'custom-hud',
    title: 'Custom HUD background',
    default: [options[0]],
    description: 'Change the marbled HUD background.',
    settings: {
      type: 'multi-select',
      number: 1,
      options,
    },
  }];
};
