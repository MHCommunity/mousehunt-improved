/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
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

  return [{
    id: 'custom-horn',
    title: 'Custom Horn <a class="mh-improved-custom-horn-show-horn">Show Horn</a>',
    default: [options[0]],
    description: 'Change the horn to an event horn or a different color.',
    settings: {
      type: 'multi-select',
      number: 1,
      options,
    },
  }];
};
