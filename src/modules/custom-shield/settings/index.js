export default function (subModule, module) {
  const options = [
    {
      name: 'Default',
      value: 'default',
    },
    {
      name: 'Birthday',
      value: 'birthday',
    },
    {
      name: 'Birthday (Year 10)',
      value: 'birthday.year10',
    },
    {
      name: 'Birthday (Year 11)',
      value: 'birthday.year11',
    },
    {
      name: 'Birthday (Year 12)',
      value: 'birthday.year12',
    },
    {
      name: 'Birthday (Year 13)',
      value: 'birthday.year13',
    },
    {
      name: 'Birthday (Year 14)',
      value: 'birthday.year14',
    },
    {
      name: 'Birthday (Year 15)',
      value: 'birthday.year15',
    },
    {
      name: 'Halloween',
      value: 'halloween',
    },
    {
      name: 'Remembrance Day',
      value: 'remembrance_day',
    },
    {
      name: 'Valentine\'s',
      value: 'valentines',
    },
    {
      name: 'Great Winter Hunter',
      value: 'winter_hunt',
    },
    {
      name: 'Larry\'s Football Challenge',
      value: 'larrys_football_challenge',
    },
    {
      name: 'Title ',
      value: 'title',
    },
    {
      name: 'Fabled ',
      value: 'fabled',
    },
    {
      name: 'Scrambles ',
      value: 'scrambles',
    },
    {
      name: 'Jerry ',
      value: 'jerry',
    },
    {
      name: 'Romeno ',
      value: 'romeno',
    },
    {
      name: 'Captain America',
      value: 'capt-america',
    },
    {
      name: 'Hylian Shield',
      value: 'hylian',
    },
  ];

  addSetting(
    'Custom Shield',
    'custom-shield',
    [options[0]],
    'Replace the default shield with a custom one.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings',
    {
      type: 'multi-select',
      number: 1,
      options,
    }
  );
}
