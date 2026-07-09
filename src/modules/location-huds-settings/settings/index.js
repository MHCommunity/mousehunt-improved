/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'location-huds.location-hud-toggle',
      title: 'Enable quick toggle (top menu bar)',
    },
    {
      id: 'location-huds.flip-avatar-images',
      title: 'Flip avatar images in Bountiful Beanstalk and Valour Rift',
    },
    {
      id: 'location-huds.bountiful-beanstalk-quick-harp-toggle',
      title: 'Bountiful Beanstalk: Enable Auto-Harp toggle',
    },
    {
      id: 'location-huds.bountiful-beanstalk-inventory-in-one-row',
      title: 'Bountiful Beanstalk: Inventory in one row',
    },
    {
      id: 'location-huds.fi-draggable-airship',
      title: 'Floating Islands: Draggable Airship',
    },
    {
      id: 'location-huds.school-of-sorcery-clean-chalkboard',
      title: 'School of Sorcery: Clean chalkboard',
    },
    {
      id: 'location-huds.table-of-contents-scrambles',
      title: 'Table of Contents: Show Scrambles quote on blank page',
      default: true,
    }
  ];
};
