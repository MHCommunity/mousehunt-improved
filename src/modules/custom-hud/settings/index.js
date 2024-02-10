import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default (module) => {
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

  return addMhuiSetting(
    'custom-hud',
    'Custom HUD background',
    [options[0]],
    'Change the marbled HUD background.',
    module,
    {
      type: 'multi-select',
      number: 1,
      options,
    }
  );
}
