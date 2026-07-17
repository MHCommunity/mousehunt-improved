/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'location-huds.location-hud-toggle',
      title: 'Location HUDs: Enable quick toggle (top menu bar)',
    },
    {
      id: 'location-huds.flip-avatar-images',
      title: 'Location HUDs: Flip avatar images in Bountiful Beanstalk and Valour Rift',
    },
    {
      id: 'location-huds.bountiful-beanstalk-quick-harp-toggle',
      title: 'Location HUDs - Bountiful Beanstalk: Enable Auto-Harp toggle',
    },
    {
      id: 'location-huds.bountiful-beanstalk-inventory-in-one-row',
      title: 'Location HUDs - Bountiful Beanstalk: Inventory in one row',
    },
    {
      id: 'location-huds.fi-draggable-airship',
      title: 'Location HUDs - Floating Islands: Draggable Airship',
    },
    {
      id: 'location-huds.school-of-sorcery-clean-chalkboard',
      title: 'Location HUDs - School of Sorcery: Clean chalkboard',
    },
    {
      id: 'location-huds.table-of-contents-scrambles',
      title: 'Location HUDs - Table of Contents: Show Scrambles quote on blank page',
      default: true,
    },
  ];
};
