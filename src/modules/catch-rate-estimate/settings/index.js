/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'catch-rate-estimate.show-trap-highlight',
    title: 'Show catch rate indicator above trap view',
    default: false,
  }];
};
