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
        {
          name: 'Spring Egg Hunt',
          value: 'huntersHornView--seasonalEvent-springEggHunt',
        }
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
    title: 'Custom Horn <span class="mh-improved-custom-horn-links"><a class="mh-improved-custom-horn-show-horn">Show Horn</a><span class="seperator">·</span><a class="mh-improved-custom-horn-preview">Preview choices</a></span>',
    default: [options[0]],
    description: 'Customize the horn with event or color themes.',
    settings: {
      type: 'multi-select',
      number: 1,
      options,
    },
  }];
};
