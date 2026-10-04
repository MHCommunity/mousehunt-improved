import { isAppleOS } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const copyOptions = [
    { name: 'Copy ID button when hovering your profile picture', value: 'button' },
    { name: 'Click your profile picture', value: 'profile-picture' },
    { name: 'Off', value: 'off' },
  ];

  return [
    {
      id: 'hunter-id-shortcuts.copy-mode',
      title: 'Copy your Hunter ID',
      default: [copyOptions[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: copyOptions,
      },
    },
    {
      id: 'hunter-id-shortcuts.paste',
      title: 'Open a hunter’s profile when you paste their ID',
      description: `Press ${isAppleOS ? 'CMD' : 'Ctrl'} + V outside a text field with a Hunter ID or profile link copied.`,
      default: true,
    },
  ];
};
