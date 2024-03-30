/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'copy-id-button.hide-button',
      title: 'Hide button <em>(click profile pic to copy ID)</em>',
      default: false,
    },
  ];
};
