/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-friends.hover-profiles',
      title: 'Show a mini profile when hovering over a name',
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
      title: 'Add an On Maps tab to the Friends page',
      description: 'See which of your friends are on a map, and open it.',
      default: false,
    },
  ];
};
