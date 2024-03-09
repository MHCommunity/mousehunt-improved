/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'better-quests.m400-helper',
    title: 'M400 Helper',
    default: true,
    description: 'Adds a "Travel to next step" button to the M400 quest.',
  }];
};
