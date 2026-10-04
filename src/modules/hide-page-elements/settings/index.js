import { getSetting } from '@utils';

import elements from '../elements';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'hide-page-elements.hide',
      title: 'Hidden elements',
      default: [],
      live: true,
      settings: {
        type: 'multi-toggle',
        options: elements.map((element) => ({
          id: element.id,
          name: element.name,
          value: getSetting(`hide-page-elements.hide-${element.id}`, element.default),
        })),
      },
    },
  ];
};
