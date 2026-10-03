/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'custom-menu',
      title: 'Custom menu <span class="mhui-setting-title-links"><a class="mh-improved-custom-menu-open">Edit menu</a></span>',
      description: 'Reorder the items in the top menu, or hide the ones you don’t use.',
      settings: {
        type: 'blank',
      },
    },
  ];
};
