import { getFlag } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'lgs-reminder.new-style',
      title: 'Use "new" style',
      default: false,
      description: '',
    },
    {
      id: 'lgs-reminder.show-seconds',
      title: 'Show exact time',
      default: getFlag('lgs-reminder-exact'),
      description: 'Show exact time, including seconds',
    }
  ];
};
