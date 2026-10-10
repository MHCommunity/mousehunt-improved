/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'custom-trap-selector',
      title: 'Custom Trap Selector <span class="mhui-setting-title-links"><a class="mh-improved-custom-trap-selector-open">Edit trap selector</a></span>',
      description: 'Rearrange and hide the blocks under your trap, like the trap effectiveness, auras, catch rates, and codex.',
      settings: {
        type: 'blank',
      },
    },
  ];
};
