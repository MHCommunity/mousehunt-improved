/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'location-huds.flip-avatar-images',
      title: 'Flip avatar images in Bountiful Beanstalk and Valour Rift',
    },
    {
      id: 'location-huds.bountiful-beanstalk-quick-harp-toggle',
      title: 'Bountiful Beanstalk: Show Auto-Harp toggle',
    },
    {
      id: 'location-huds.bountiful-beanstalk-inventory-in-one-row',
      title: 'Bountiful Beanstalk: Show inventory in one row',
    },
    {
      id: 'location-huds.fi-draggable-airship',
      title: 'Floating Islands: Allow dragging the airship',
    },
    {
      id: 'location-huds.school-of-sorcery-clean-chalkboard',
      title: 'School of Sorcery: Clean chalkboard',
    },
    {
      id: 'location-huds.table-of-contents-scrambles',
      title: 'Table of Contents: Show Scrambles quote on blank page',
      default: true,
    },
  ];
};
