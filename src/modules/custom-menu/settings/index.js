/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'custom-menu',
      title: 'Custom Menu <span class="mhui-setting-title-links"><a class="mh-improved-custom-menu-open">Edit top menu</a></span>',
      description: 'Edit the top menu, rearrange, hide, and add shortcuts, toggles, and pin items.',
      settings: {
        type: 'blank',
      },
    },
  ];
};
