/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-friends.hover-profiles',
      title: 'Show profiles on hover',
      default: true,
    },
    {
      id: 'better-friends.emotes',
      title: 'Show emotes on corkboards',
      description:
        'Turns Discord-style emotes like :jerry: into images on map and profile corkboards. <a href="https://github.com/MHCommunity/mousehunt-improved/blob/main/docs/better-friends.md#emotes" target="_blank" rel="noreferrer">See the supported emotes</a>.',
      default: true,
    },
    {
      id: 'better-friends.egg-master',
      title: 'Add the Egg Master icon to profiles',
      default: true,
    },
    {
      id: 'better-friends.friends-on-maps',
      title: 'Add "On Maps" tab to Friends page',
      default: false,
    },
  ];
};
