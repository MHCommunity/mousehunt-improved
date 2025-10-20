import { clearCaches, deleteSetting, getData, sleep } from '@utils';

export default {
  version: '0.93.0',
  update: async () => {
    // Moved from 'mh-improved-updates-completed' to 'updates-completed'.
    deleteSetting('mh-improved-updates-completed');

    await clearCaches();

    const files = [
      'brift-mice-per-mist-level',
      'community-map-data',
      'library-assignments',
      'm400-locations',
      'marketplace-hidden-items',
      'mhct-convertibles',
      'relic-hunter-hints',
      'scoreboards',
      'scrolls-to-maps',
      'titles',
      'trap-special-effects',
      'ultimate-checkmark',
    ];

    for (const file of files) {
      try {
        const data = await getData(file, true);
        if (! data) {
          await sleep(1000);
          await getData(file, true);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error preloading data for ${file}:`, error);
      }
    }
  }
};
