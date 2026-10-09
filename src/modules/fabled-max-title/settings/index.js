import { getSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const styleOptions = [
    { name: 'Custom text', value: 'custom' },
    { name: 'Random title', value: 'random' },
    { name: 'Completed progress bar', value: 'progress-bar' },
  ];

  return [
    {
      id: 'fabled-max-title.style',
      title: 'Show',
      default: [styleOptions[0]],
      live: true,
      settings: {
        type: 'multi-select',
        number: 1,
        options: styleOptions,
      },
    },
    {
      id: 'fabled-max-title.custom-text',
      title: 'Custom text',
      default: 'MAX TITLE',
      live: true,
      showIf: () => 'custom' === getSetting('fabled-max-title.style-0', 'custom'),
      settings: {
        type: 'input',
      },
    },
  ];
};
