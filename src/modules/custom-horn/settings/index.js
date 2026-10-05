import { makeElement } from '@utils';

/**
 * Make the markup for a horn preview.
 *
 * @param {Object} horn    The horn.
 * @param {string} horn.id The horn's setting value.
 *
 * @return {string} The markup.
 */
const hornPreview = (horn) => {
  return `<div class="mh-improved-custom-horn-preview ${horn.id}">
  <a class="huntersHornView__horn huntersHornView__horn--default huntersHornView__horn--reveal huntersHornView__horn--ready">
    <div class="huntersHornView__hornImage">
      <div class="huntersHornView__hornForeground"></div>
      <div class="huntersHornView__hornGlint">
        <div class="huntersHornView__hornGlintImage"></div>
        <img class="huntersHornView__hornGlintAnimatedGif" alt="" />
      </div>
    </div>
    <div class="huntersHornView__hornBanner">
      <div class="huntersHornView__hornBannerTranslate">
        <div class="huntersHornView__hornBannerImage"></div>
      </div>
    </div>
  </a>
</div>`;
};

/**
 * Make the horn preview for the setting's picker.
 *
 * @param {Object} option The option.
 *
 * @return {HTMLElement} The preview.
 */
const pickerPreview = (option) => {
  const preview = makeElement('span', 'mh-improved-custom-horn-picker-preview');
  preview.innerHTML = hornPreview({ id: option.value });

  return preview;
};

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

  return [
    {
      id: 'custom-horn',
      live: true,
      title: 'Custom Horn',
      default: [options[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        searchable: true,
        placeholder: 'Search horns…',
        preview: pickerPreview,
        options,
      },
    },
  ];
};
