/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'copy-id-button.hide-button',
    title: 'Hide button',
    description: 'Click your profile picture to copy ID.',
    default: false,
  }];
};
