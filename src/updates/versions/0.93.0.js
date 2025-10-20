import { cacheExpire } from '@utils';

export default {
  version: '0.93.0',
  update: async () => {
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
      await cacheExpire(`data-${file}`);
    }
  }
};
