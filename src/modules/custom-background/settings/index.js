import gradients from '@data/backgrounds.json';

const eventBackgrounds = 'https://www.mousehuntgame.com/images/ui/backgrounds/events';

/**
 * Build a preview swatch that flanks the event's column art the way the page frame does.
 *
 * @param {string} event      The event's background folder.
 * @param {string} color      The event's background color.
 * @param {string} extension  The image extension.
 * @param {string} filePrefix The prefix on the image filenames.
 *
 * @return {string} The background value for the swatch.
 */
const eventPreview = (event, color, extension = 'png', filePrefix = '') => {
  const image = (side) => `url(${eventBackgrounds}/${event}/${filePrefix}${side}.${extension}) no-repeat ${side} center`;

  return `${image('left')}, ${image('right')}, ${color}`;
};

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
      name: 'Events',
      value: 'group',
      options: [
        { name: 'Birthday', value: 'birthday', css: eventPreview('birthday', '#bad4ed') },
        { name: 'Great Winter Hunt', value: 'great_winter_hunt', css: eventPreview('great_winter_hunt', '#bad4ed', 'jpg') },
        { name: 'Halloween', value: 'halloween', css: eventPreview('halloween', '#e87e33') },
        { name: "King's Giveaway", value: 'kings_giveaway', css: eventPreview('kings_giveaway', '#7b67aa', 'jpg', 'app_frame_') },
        { name: 'Lunar New Year', value: 'lunar_new_year', css: eventPreview('lunar_new_year', '#7f051b') },
        { name: 'Spring Egg Hunt', value: 'spring_hunt', css: eventPreview('spring_hunt', '#86ce5c') },
        { name: "Valentine's", value: 'valentines', css: eventPreview('valentines', '#f69798') },
      ],
    },
    {
      name: 'Color',
      value: 'group',
      options: [
        { name: 'Blue', value: 'background-color-blue', css: '#bad4ed' },
        { name: 'Cyan', value: 'background-color-cyan', css: '#abdbd3' },
        { name: 'Green', value: 'background-color-green', css: '#b4dbb8' },
        { name: 'Pink', value: 'background-color-pink', css: '#e8c6eb' },
        { name: 'Purple', value: 'background-color-purple', css: '#d8caf3' },
        { name: 'Red', value: 'background-color-red', css: '#f2c7c5' },
        { name: 'Faded', value: 'background-color-faded', css: '#fff4c5' },
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
      id: 'custom-background',
      live: true,
      title: 'Custom background',
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
