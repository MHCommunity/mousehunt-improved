import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  const options = [
    { name: 'Default', value: 'default' },
    { name: 'Tournament Horn', value: 'huntersHornView__horn--tournament' },
    {
      name: 'Events',
      value: 'group',
      options: [
        { name: 'Birthday', value: 'huntersHornView--seasonalEvent-birthday' },
        {
          name: 'Great Winter Hunt',
          value: 'huntersHornView--seasonalEvent-greatWinterHunt',
        },
        {
          name: 'Halloween',
          value: 'huntersHornView--seasonalEvent-halloween',
        },
        {
          name: 'Lunar New Year',
          value: 'huntersHornView--seasonalEvent-lunarNewYear',
        },
      ],
    },
    {
      name: 'Color',
      value: 'group',
      options: [
        { name: 'Blue', value: 'horn-color-blue' },
        { name: 'Cyan', value: 'horn-color-cyan' },
        { name: 'Green', value: 'horn-color-green' },
        { name: 'Pink', value: 'horn-color-pink' },
        { name: 'Purple', value: 'horn-color-purple' },
        { name: 'Red', value: 'horn-color-red' },
        { name: 'Faded', value: 'horn-color-faded' },
        { name: 'Rainbow', value: 'horn-color-rainbow' },
      ],
    },
  ];
  addMhuiSetting(
    'custom-horn',
    'Custom Horn <a class="mh-improved-custom-horn-show-horn">Show Horn</a>',
    [options[0]],
    'Replace the horn.',
    module,
    {
      type: 'multi-select',
      number: 1,
      options,
    }
  );
}
